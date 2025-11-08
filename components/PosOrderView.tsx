import React, { useState, useEffect, useMemo } from 'react';
import { Order, Table, OrderItem, MenuItem, OrderStatus, OrderType, TableStatus } from '../types';
import { useData } from '../context/DataContext';
import { useAuth, addOrder, updateOrder } from '../auth';
import { TrashIcon, XMarkIcon, ScissorsIcon } from './Icons';
import PaymentModal from './PaymentModal';
import { notificationService } from '../services/notificationService';
import AiUpsellWidget from './AiUpsellWidget';
import BillSplitModal from './BillSplitModal';


interface PosOrderViewProps {
    table: Table | null;
    order: Order | null;
    onClose: () => void;
    onOrderUpdate: () => void;
}

const PosOrderView: React.FC<PosOrderViewProps> = ({ table, order, onClose, onOrderUpdate }) => {
    const { menuItems } = useData();
    const { currentUser } = useAuth();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBillSplitModalOpen, setIsBillSplitModalOpen] = useState(false);

    useEffect(() => {
        if (order) {
            setItems(order.items);
            setCustomerName(order.customerName);
        } else if (table) {
            setItems([]);
            setCustomerName(`Table ${table.number}`);
        } else {
            setItems([]);
            setCustomerName('');
        }
    }, [order, table]);

    const total = useMemo(() => {
        return items.reduce((acc, currentItem) => {
            const menuItem = menuItems.find(mi => mi.id === currentItem.menuItemId);
            return acc + (menuItem ? menuItem.price * currentItem.quantity : 0);
        }, 0);
    }, [items, menuItems]);
    
    const handleAddItem = (menuItem: MenuItem) => {
        if (menuItem.stock <= 0) return;
        setItems(prevItems => {
            const existing = prevItems.find(i => i.menuItemId === menuItem.id && !i.selectedModifiers?.length); // Simple check for non-customized items
            if (existing) {
                return prevItems.map(i => i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevItems, { menuItemId: menuItem.id, name: menuItem.name, quantity: 1 }];
        });
    };

    const handleQuantityChange = (menuItemId: string, quantity: number) => {
        if (quantity < 1) {
            setItems(items.filter(item => item.menuItemId !== menuItemId));
            return;
        }
        setItems(items.map(item => item.menuItemId === menuItemId ? { ...item, quantity } : item));
    };

    const handleSaveOrUpdateOrder = () => {
        if (!currentUser || (!table && !order)) return;

        const isNewOrder = !order || order.id.startsWith('temp_');

        const orderData = {
            customerName,
            items,
            total,
            type: order?.type || (table ? OrderType.DINE_IN : OrderType.TAKEOUT),
            tableNumber: table?.number,
        };

        // FIX: The `finalOrderData` was inferred as a union type, causing issues with type checking.
        // By defining it inside the conditional blocks, TypeScript can correctly infer its type for each function call.
        if (isNewOrder) {
            const newOrderData = {
                 ...orderData,
                 status: OrderStatus.PREPARING,
                 paymentStatus: 'Unpaid' as const,
            };
            addOrder(newOrderData, currentUser);
            notificationService.notify({ title: 'Order Placed', message: `New order for ${customerName} sent to kitchen.`, type: 'success' });
        } else {
             // TypeScript knows `order` is not null here because `isNewOrder` would be true otherwise.
             const updatedOrderData = { ...order!, ...orderData };
             updateOrder(updatedOrderData, currentUser);
             notificationService.notify({ title: 'Order Updated', message: `Order for ${customerName} has been sent to the kitchen.`, type: 'info' });
        }
        onOrderUpdate();
    };

    const handleAcceptOrder = () => {
        if (!currentUser || !order) return;
        updateOrder({ ...order, status: OrderStatus.PREPARING }, currentUser);
        notificationService.notify({ title: 'Order Accepted', message: `Order #${order.id.slice(-4)} sent to kitchen.`, type: 'info' });
    };
    
    const handleMarkAsPickedUp = () => {
        if (!currentUser || !order) return;
        updateOrder({ ...order, status: OrderStatus.DELIVERED }, currentUser);
        notificationService.notify({ title: 'Order Complete', message: `Order #${order.id.slice(-4)} marked as picked up.`, type: 'success' });
        onClose();
    };

    const handlePaymentSuccess = (method: 'Cash' | 'Card' | 'Online') => {
        if (!currentUser || !order) return;
        
        const nextStatus = order.type === OrderType.DELIVERY ? OrderStatus.READY : OrderStatus.DELIVERED;

        updateOrder({
            ...order,
            items: items,
            total: total,
            paymentStatus: 'Paid',
            paymentMethod: method,
            status: nextStatus,
        }, currentUser);
        notificationService.notify({ title: 'Payment Success', message: `Payment of ₹${total.toFixed(2)} recorded.`, type: 'success' });
        setIsPaymentModalOpen(false);
        onClose();
    };
    
    if (!table && !order) {
        return <div className="p-6 text-center text-gray-500 flex items-center justify-center h-full">Select a table or order to view details.</div>
    }

    return (
      <>
        <div className="flex flex-col h-full bg-gray-900 text-gray-200">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="font-bold text-lg text-white">
              {table ? `Table ${table.number}` : (order?.id.startsWith('temp_') ? 'New Order' : `Order #${order?.id.slice(-4)}`)}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow p-4 space-y-2 overflow-y-auto bg-gray-800">
            {items.map(item => (
               <div key={item.menuItemId} className="flex justify-between items-center bg-gray-900 p-2 rounded-md border border-gray-700">
                  <div>
                      <p className="font-semibold text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-400">₹{menuItems.find(mi => mi.id === item.menuItemId)?.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.menuItemId, parseInt(e.target.value))} className="w-14 p-1 text-center text-white rounded bg-gray-700 border border-gray-600" />
                      <button onClick={() => handleQuantityChange(item.menuItemId, 0)} className="text-red-400 p-1 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                  </div>
              </div>
            ))}
             {items.length === 0 && <p className="text-gray-500 text-center mt-4">No items in this order yet.</p>}
          </div>

          <AiUpsellWidget currentItems={items} onAddItem={handleAddItem} />
          
          <div className="p-2 border-y border-gray-700 h-64 overflow-y-auto bg-gray-800">
               <div className="grid grid-cols-3 gap-2">
               {menuItems.filter(item => item.stock > 0).map(item => (
                  <button key={item.id} onClick={() => handleAddItem(item)} className="p-2 rounded-md bg-gray-900 shadow-sm text-left transition-transform hover:scale-105 border border-gray-700 hover:border-amber-500">
                      <p className="font-semibold text-sm text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-400">₹{item.price.toFixed(2)}</p>
                  </button>
               ))}
               </div>
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-900">
             <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl text-white">Total</span>
                  <span className="font-bold text-xl text-white">₹{total.toFixed(2)}</span>
             </div>

              {order?.status === OrderStatus.AWAITING_ACCEPTANCE ? (
                 <button onClick={handleAcceptOrder} className="w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                     Accept Order
                 </button>
             ) : order?.status === OrderStatus.READY && order.type === OrderType.TAKEOUT && order.paymentStatus === 'Paid' ? (
                 <button onClick={handleMarkAsPickedUp} className="w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                     Mark as Picked Up
                 </button>
             ) : (
                 <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleSaveOrUpdateOrder} disabled={items.length === 0} className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
                            {order && !order.id.startsWith('temp_') ? 'Update & KOT' : 'Save & KOT'}
                        </button>
                        <button onClick={() => setIsPaymentModalOpen(true)} disabled={items.length === 0 || order?.paymentStatus === 'Paid'} className="w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600">
                            Settle Bill
                        </button>
                   </div>
                    {order && order.paymentStatus === 'Unpaid' && (
                        <button onClick={() => setIsBillSplitModalOpen(true)} className="w-full py-2 text-sm font-semibold text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2">
                            <ScissorsIcon className="w-4 h-4" />
                            Split Bill
                        </button>
                    )}
                 </div>
             )}
          </div>
        </div>
        
        {isPaymentModalOpen && (order || table) && (
            <PaymentModal 
                orderTotal={total}
                orderDetails={order || { customerName, items, total, tableNumber: table?.number }}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        )}


        {isBillSplitModalOpen && order && (
            <BillSplitModal
                order={order}
                onClose={() => setIsBillSplitModalOpen(false)}
            />
        )}
      </>
    );
};

export default PosOrderView;