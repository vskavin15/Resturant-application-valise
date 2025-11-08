import React, { useState, useMemo } from 'react';
import { Order, OrderItem, Bill } from '../types';
import { useAuth, updateOrder } from '../auth';
import { CloseIcon, TrashIcon, QrCodeIcon, UsersIcon } from './Icons';
import { useData } from '../context/DataContext';

interface BillSplitModalProps {
    order: Order;
    onClose: () => void;
}

const BillSplitModal: React.FC<BillSplitModalProps> = ({ order, onClose }) => {
    const { currentUser } = useAuth();
    const { menuItems } = useData();
    const [bills, setBills] = useState<Bill[]>(order.bills || [{ id: `bill_${Date.now()}`, items: [], total: 0, paymentStatus: 'Unpaid' }]);

    const unassignedItems = useMemo(() => {
        const assignedItemMap = new Map<string, number>();
        bills.forEach(bill => {
            bill.items.forEach(item => {
                assignedItemMap.set(item.menuItemId, (assignedItemMap.get(item.menuItemId) || 0) + item.quantity);
            });
        });

        return order.items.map(orderItem => {
            const assignedQty = assignedItemMap.get(orderItem.menuItemId) || 0;
            return { ...orderItem, quantity: orderItem.quantity - assignedQty };
        }).filter(item => item.quantity > 0);
    }, [order.items, bills]);

    const calculateBillTotal = (items: OrderItem[]): number => {
        return items.reduce((sum, item) => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            return sum + (menuItem ? menuItem.price * item.quantity : 0);
        }, 0);
    };

    const addBill = () => {
        setBills([...bills, { id: `bill_${Date.now() + bills.length}`, items: [], total: 0, paymentStatus: 'Unpaid' }]);
    };

    const assignItemToBill = (item: OrderItem, billIndex: number) => {
        const newBills = [...bills];
        const bill = newBills[billIndex];
        
        const existingItem = bill.items.find(i => i.menuItemId === item.menuItemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            bill.items.push({ ...item, quantity: 1 });
        }
        
        bill.total = calculateBillTotal(bill.items);
        setBills(newBills);
    };

    const handleSave = () => {
        if (!currentUser) return;
        updateOrder({ ...order, bills }, currentUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Split Bill for Order #{order.id.slice(-4)}</h3>
                    <button onClick={onClose} className="p-1.5"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                    {/* Unassigned Items */}
                    <div className="w-1/3 flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                        <h4 className="font-bold text-center p-2">Order Items</h4>
                        <div className="overflow-y-auto space-y-2 p-1">
                            {unassignedItems.map(item => (
                                <div key={item.menuItemId} className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                                    <p className="font-semibold">{item.name} <span className="text-gray-500">x{item.quantity}</span></p>
                                </div>
                            ))}
                            {unassignedItems.length === 0 && <p className="text-center text-sm text-gray-500 p-4">All items assigned.</p>}
                        </div>
                    </div>

                    {/* Bills */}
                    <div className="w-2/3 flex gap-4 overflow-x-auto pb-2">
                        {bills.map((bill, billIndex) => (
                            <div key={bill.id} className="w-64 flex-shrink-0 bg-blue-50 dark:bg-blue-900/50 rounded-lg p-2 flex flex-col">
                                <h5 className="font-bold text-center p-2">Bill {billIndex + 1}</h5>
                                <div className="overflow-y-auto space-y-2 p-1 flex-grow">
                                    {bill.items.map(item => (
                                        <div key={item.menuItemId} className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                                            <p className="font-semibold">{item.name} <span className="text-gray-500">x{item.quantity}</span></p>
                                        </div>
                                    ))}
                                    {unassignedItems.map(item => (
                                        <button key={item.menuItemId} onClick={() => assignItemToBill(item, billIndex)} className="w-full text-left p-2 bg-white/50 dark:bg-gray-700/50 rounded border-dashed border-2 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-green-900/50">
                                            + Add {item.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 font-bold text-lg text-right border-t dark:border-gray-700">
                                    Total: ₹{bill.total.toFixed(2)}
                                </div>
                            </div>
                        ))}
                        <button onClick={addBill} className="w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 rounded-lg border-2 border-dashed flex items-center justify-center">
                            + Add Person
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save Split</button>
                </div>
            </div>
        </div>
    );
};

export default BillSplitModal;