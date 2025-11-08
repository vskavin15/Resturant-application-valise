import React, { useMemo } from 'react';
// FIX: Corrected import paths.
import { OrderStatus, OrderType } from '../types';
import KdsTicket from '../components/KdsTicket';
import { useData } from '../context/DataContext';

const KitchenDisplayScreen: React.FC = () => {
  const { orders: allOrders } = useData();

  const kitchenOrders = useMemo(() => {
    return allOrders
      .filter(order => [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.AWAITING_ACCEPTANCE].includes(order.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [allOrders]);

  const dineInOrders = kitchenOrders.filter(o => o.type === OrderType.DINE_IN);
  const takeoutOrders = kitchenOrders.filter(o => o.type === OrderType.TAKEOUT);
  const deliveryOrders = kitchenOrders.filter(o => o.type === OrderType.DELIVERY);

  return (
    <div className="container mx-auto h-full flex flex-col bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-100 mb-4">Kitchen Display</h1>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Dine-In Column */}
        <div className="flex flex-col bg-gray-800 rounded-lg p-2">
          <h2 className="text-xl font-semibold text-center text-blue-300 py-2 border-b-2 border-blue-500">Dine-In</h2>
          <div className="flex-grow overflow-y-auto space-y-4 p-2">
            {dineInOrders.length > 0 ? (
                dineInOrders.map(order => <KdsTicket key={order.id} order={order} />)
            ) : (
                <p className="text-center text-gray-500 mt-4">No Dine-In orders.</p>
            )}
          </div>
        </div>

        {/* Takeout Column */}
        <div className="flex flex-col bg-gray-800 rounded-lg p-2">
          <h2 className="text-xl font-semibold text-center text-indigo-300 py-2 border-b-2 border-indigo-500">Takeout</h2>
          <div className="flex-grow overflow-y-auto space-y-4 p-2">
            {takeoutOrders.length > 0 ? (
                takeoutOrders.map(order => <KdsTicket key={order.id} order={order} />)
            ) : (
                <p className="text-center text-gray-500 mt-4">No Takeout orders.</p>
            )}
          </div>
        </div>

        {/* Delivery Column */}
        <div className="flex flex-col bg-gray-800 rounded-lg p-2 md:col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold text-center text-purple-300 py-2 border-b-2 border-purple-500">Delivery</h2>
          <div className="flex-grow overflow-y-auto p-2">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {deliveryOrders.length > 0 ? (
                    deliveryOrders.map(order => <KdsTicket key={order.id} order={order} />)
                ) : (
                    <p className="text-center text-gray-500 mt-4 col-span-2">No Delivery orders.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplayScreen;