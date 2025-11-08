
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import paths.
// FIX: Removed 'Partial' from import as it is a built-in TypeScript type.
import { Order, OrderStatus, OrderType } from '../types';
// FIX: Import useAuth to get the current user for action logging.
import { addOrder, updateOrder, useAuth } from '../auth';
import { CloseIcon, TrashIcon } from './Icons';
import { notificationService } from '../services/notificationService';
import { useData } from '../context/DataContext';
import PaymentModal from './PaymentModal';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onSave: () => void;
  tableNumber?: number;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onSave, tableNumber }) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [items, setItems] = useState<Order['items']>([]);
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { menuItems } = useData();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(menuItems[0]?.id || '');
  const { currentUser } = useAuth();

  const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName);
      setOrderType(order.type);
      setItems(order.items);
      setStatus(order.status);
    } else if (tableNumber) {
        setCustomerName(`Table ${tableNumber}`);
        setOrderType(OrderType.DINE_IN);
        setItems([]);
        setStatus(OrderStatus.PENDING);
    } else {
        setCustomerName('');
        setOrderType(OrderType.TAKEOUT);
        setItems([]);
        setStatus(OrderStatus.PENDING);
    }
  }, [order, tableNumber]);

  const total = useMemo(() => {
    return items.reduce((acc, currentItem) => {
      const menuItem = menuItems.find(mi => mi.id === currentItem.menuItemId);
      return acc + (menuItem ? menuItem.price * currentItem.quantity : 0);
    }, 0);
  }, [items, menuItems]);

  const handleAddItem = () => {
    if (!selectedMenuItem) return;

    const existingItemIndex = items.findIndex(item => item.menuItemId === selectedMenuItem);
    const menuItem = menuItems.find(mi => mi.id === selectedMenuItem);
    if (!menuItem) return;

    if (existingItemIndex > -1) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, { menuItemId: selectedMenuItem, quantity: 1, name: menuItem.name }]);
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    setItems(items.filter(item => item.menuItemId !== menuItemId));
  };
  
  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    if (quantity < 1) {
        handleRemoveItem(menuItemId);
        return;
    }
    const newItems = items.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
    setItems(newItems);
  };

  const handleSave = () => {
    const editableOrderData: Partial<Order> = {
      customerName,
      type: orderType,
      items,
      total,
      status,
      tableNumber: order ? order.tableNumber : orderType === OrderType.DINE_IN ? tableNumber : undefined,
    };

    if (order) {
      // When EDITING, only update the editable fields. Do NOT touch payment status.
      if (currentUser) {
        updateOrder({ ...order, ...editableOrderData }, currentUser);
      }
    } else {
      // When CREATING, default payment status to Unpaid.
      if (currentUser) {
        const newOrderData = {
          ...editableOrderData,
          paymentStatus: 'Unpaid' as const,
        };
        addOrder(newOrderData, currentUser);
      }
    }
    onSave();
  };
  
  const handlePaymentSuccess = (method: 'Cash' | 'Card' | 'Online') => {
    if (!currentUser) return;
    
    const orderData = {
      customerName,
      type: orderType,
      items,
      total,
      // If paying, order goes straight to preparing
      status: status === OrderStatus.PENDING ? OrderStatus.PREPARING : status, 
      tableNumber: order ? order.tableNumber : orderType === OrderType.DINE_IN ? tableNumber : undefined,
      paymentStatus: 'Paid' as const,
      paymentMethod: method,
    };

    if (order) {
        updateOrder({ ...order, ...orderData }, currentUser);
    } else {
        addOrder(orderData, currentUser);
    }

    notificationService.notify({ 
        title: 'Payment Recorded', 
        message: `Order marked as paid via ${method}.`, 
        type: 'success' 
    });

    setIsPaymentModalOpen(false);
    onSave(); // This closes the OrderModal
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {order ? `Edit Order #${order.id.split('_')[1]}` : 'Create New Order'}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="customerName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer/Table Name</label>
                      <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputStyles} required />
                  </div>
                  <div>
                      <label htmlFor="orderType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order Type</label>
                      <select id="orderType" value={orderType} onChange={e => setOrderType(e.target.value as OrderType)} className={inputStyles}>
                          {Object.values(OrderType).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                  </div>
              </div>
              {order && (
                   <div>
                      <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order Status</label>
                      <select id="status" value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inputStyles}>
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
              )}
               <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Order Items</h4>
                  <div className="flex gap-2 mb-4">
                      <select value={selectedMenuItem} onChange={e => setSelectedMenuItem(e.target.value)} className={`flex-grow ${inputStyles}`}>
                           {menuItems.map(item => <option key={item.id} value={item.id}>{item.name} - ₹{item.price.toFixed(2)}</option>)}
                      </select>
                      <button onClick={handleAddItem} className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Add</button>
                  </div>
                  <div className="space-y-2">
                      {items.map(item => {
                          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                          return (
                              <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div>
                                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{menuItem?.price.toFixed(2)} each</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                       <input 
                                          type="number" 
                                          value={item.quantity}
                                          onChange={e => handleQuantityChange(item.menuItemId, parseInt(e.target.value, 10))}
                                          className="w-16 p-1 text-center bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
                                      />
                                      <button onClick={() => handleRemoveItem(item.menuItemId)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full">
                                          <TrashIcon className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
               </div>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Total: ₹{total.toFixed(2)}</span>
              <div className="flex items-center space-x-2">
                  <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-800/50">
                      {order ? 'Update Order' : 'Save as Unpaid'}
                  </button>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={total <= 0}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-500/50 disabled:bg-gray-400"
                  >
                      Proceed to Payment
                  </button>
              </div>
          </div>
        </div>
      </div>
      {isPaymentModalOpen && (
        <PaymentModal 
            orderTotal={total}
            orderDetails={{ customerName, items }}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default OrderModal;