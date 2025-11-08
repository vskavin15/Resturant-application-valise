import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, OrderType, MenuItem } from '../types';
import { updateOrder, useAuth } from '../auth';
import { useData } from '../context/DataContext';

interface KdsTicketProps {
  order: Order;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const KdsTicket: React.FC<KdsTicketProps> = ({ order }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(
    (new Date().getTime() - new Date(order.createdAt).getTime()) / 1000
  );
  const { currentUser } = useAuth();
  const { menuItems } = useData();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((new Date().getTime() - new Date(order.createdAt).getTime()) / 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const { longestPrepTime, itemsWithPrep } = useMemo(() => {
      let maxPrep = 0;
      const itemsWithPrep = order.items.map(item => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          const prepTime = menuItem?.prepTime || 0;
          if (prepTime > maxPrep) {
              maxPrep = prepTime;
          }
          return { ...item, prepTime };
      });
      return { longestPrepTime: maxPrep, itemsWithPrep };
  }, [order.items, menuItems]);
  
  const nextAction = useMemo(() => {
    if (order.status === OrderStatus.PENDING || order.status === OrderStatus.AWAITING_ACCEPTANCE) {
      return {
        text: 'Start Preparing',
        color: 'bg-yellow-500 hover:bg-yellow-600',
        nextStatus: OrderStatus.PREPARING,
      };
    }
    if (order.status === OrderStatus.PREPARING) {
      return {
        text: 'Mark as Ready',
        color: 'bg-green-500 hover:bg-green-600',
        nextStatus: OrderStatus.READY,
      };
    }
    return null;
  }, [order.status]);

  const handleUpdateStatus = () => {
    if (nextAction && currentUser) {
      updateOrder({ ...order, status: nextAction.nextStatus }, currentUser);
    }
  };

  const timerColor =
    elapsedSeconds > 600
      ? 'bg-red-500 text-white'
      : elapsedSeconds > 300
      ? 'bg-yellow-500 text-white'
      : 'bg-green-500 text-white';

  const headerColor = {
      [OrderType.DINE_IN]: 'bg-blue-600',
      [OrderType.TAKEOUT]: 'bg-indigo-600',
      [OrderType.DELIVERY]: 'bg-purple-600',
  }[order.type];

  return (
    <div className="bg-gray-100 rounded-lg shadow-md w-full flex flex-col border border-gray-300">
      <div className={`p-3 rounded-t-lg text-white ${headerColor}`}>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">
            {order.type === OrderType.DINE_IN ? `Table ${order.tableNumber}` : `#${order.id.slice(-4)}`}
          </span>
          <span className={`text-lg font-mono px-2 py-0.5 rounded ${timerColor}`}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <p className="text-sm">{order.status}</p>
      </div>

      <div className="p-4 flex-grow">
        <ul className="space-y-3">
          {itemsWithPrep.map((item, index) => {
              const holdTimeInSeconds = (longestPrepTime - item.prepTime) * 60;
              const shouldFire = order.status === OrderStatus.PREPARING && elapsedSeconds >= holdTimeInSeconds;
              const onHold = order.status === OrderStatus.PREPARING && elapsedSeconds < holdTimeInSeconds && item.prepTime < longestPrepTime;

              return (
                  <li key={index} className="text-gray-800">
                    <div className="flex items-start">
                      <span className="font-bold text-2xl mr-3">{item.quantity}x</span>
                      <div className="flex-grow">
                          <span className="text-lg leading-tight">{item.name}</span>
                          {onHold && <span className="ml-2 text-xs font-bold text-yellow-600 animate-pulse">HOLD</span>}
                          {shouldFire && <span className="ml-2 text-xs font-bold text-green-600 animate-pulse">FIRE NOW 🔥</span>}
                      </div>
                    </div>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <ul className="pl-10 mt-1 text-sm text-gray-500">
                        {item.selectedModifiers.map(mod => (
                          <li key={mod.optionId}>+ {mod.name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
              )
          })}
        </ul>
      </div>
      
      {nextAction && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleUpdateStatus}
            className={`w-full py-3 text-white font-bold rounded-md transition-colors duration-200 ${nextAction.color}`}
          >
            {nextAction.text}
          </button>
        </div>
      )}
    </div>
  );
};

export default KdsTicket;