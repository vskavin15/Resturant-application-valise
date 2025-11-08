import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, OrderType } from '../types';
import OrderModal from '../components/OrderModal';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { useData } from '../context/DataContext';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'bg-yellow-500/20 text-yellow-300';
        case OrderStatus.PREPARING: return 'bg-blue-500/20 text-blue-300';
        case OrderStatus.READY: return 'bg-purple-500/20 text-purple-300';
        case OrderStatus.OUT_FOR_DELIVERY: return 'bg-indigo-500/20 text-indigo-300';
        case OrderStatus.DELIVERED: return 'bg-green-500/20 text-green-300';
        case OrderStatus.CANCELLED: return 'bg-red-500/20 text-red-300';
        case OrderStatus.AWAITING_ACCEPTANCE: return 'bg-orange-500/20 text-orange-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

const getPaymentStatusBadge = (status: Order['paymentStatus'], method?: Order['paymentMethod']) => {
    if (status === 'Paid') {
        return (
            <span className="px-2.5 py-1 font-medium leading-tight rounded-full bg-green-500/20 text-green-300">
                Paid {method && `(${method})`}
            </span>
        );
    }
    return (
        <span className="px-2.5 py-1 font-medium leading-tight rounded-full bg-red-500/20 text-red-300">
            Unpaid
        </span>
    );
};

const OrdersScreen: React.FC = () => {
  const { orders: allOrders } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const sortedOrders = useMemo(() => {
    return [...allOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allOrders]);

  const handleOpenModalForNew = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Order Hub</h1>
        <button
          onClick={handleOpenModalForNew}
          className="px-5 py-2.5 font-semibold tracking-wide text-white capitalize transition-colors duration-200 transform bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
        >
          New Order
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-lg shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-left text-gray-400 uppercase border-b border-gray-700 bg-gray-900">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {sortedOrders.map((order) => (
                <tr key={order.id} className="text-gray-400">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">#{order.id.slice(-4)}</td>
                  <td className="px-6 py-4 text-sm">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm">{order.type}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">₹{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs">
                    {getPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2.5 py-1 font-medium leading-tight rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <button onClick={() => handleOpenModalForEdit(order)} className="px-3 py-1.5 text-sm font-medium text-amber-300 bg-amber-500/20 rounded-lg hover:bg-amber-500/40">Edit</button>
                      {order.type === OrderType.DELIVERY && order.status === OrderStatus.OUT_FOR_DELIVERY &&
                        <button onClick={() => setTrackingOrder(order)} className="px-3 py-1.5 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-lg hover:bg-blue-500/40">Track</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <OrderModal order={editingOrder} onClose={() => setIsModalOpen(false)} onSave={() => setIsModalOpen(false)} />
      )}
      {trackingOrder && (
        <OrderTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      )}
    </div>
  );
};

export default OrdersScreen;