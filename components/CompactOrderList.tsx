import React from 'react';
import { Order, OrderStatus, OrderType } from '../types';

interface CompactOrderListProps {
    orders: Order[];
    onOrderSelect: (order: Order) => void;
    type: OrderType;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'border-yellow-500 bg-gray-800';
        case OrderStatus.AWAITING_ACCEPTANCE: return 'border-orange-500 bg-gray-800';
        case OrderStatus.PREPARING: return 'border-blue-500 bg-gray-800';
        case OrderStatus.READY: return 'border-purple-500 bg-gray-800';
        default: return 'border-gray-600 bg-gray-800';
    }
};

const CompactOrderList: React.FC<CompactOrderListProps> = ({ orders, onOrderSelect, type }) => {
    const filteredOrders = orders.filter(o => o.type === type && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)
                                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-200 mb-4">{type} Orders</h2>
            {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredOrders.map(order => (
                        <button key={order.id} onClick={() => onOrderSelect(order)} className={`p-4 rounded-lg shadow-md border-l-4 text-left w-full transition-all hover:shadow-lg hover:scale-105 ${getStatusColor(order.status)}`}>
                            <p className="font-bold text-lg text-gray-100">#{order.id.slice(-4)}</p>
                            <p className="text-gray-400">{order.customerName}</p>
                            <p className="text-sm font-semibold text-gray-200 mt-2">₹{order.total.toFixed(2)}</p>
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-700 text-gray-300 rounded-full mt-2 inline-block">{order.status}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">No active {type.toLowerCase()} orders.</p>
            )}
        </div>
    );
};

export default CompactOrderList;