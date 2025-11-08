import React, { useMemo, useState } from 'react';
// FIX: Import `updateOrder` to persist rating.
import { useAuth, updateOrder } from '../../auth';
import { useData } from '../../context/DataContext';
import { Order, OrderStatus } from '../../types';
import RatingModal from '../../components/RatingModal';
import { notificationService } from '../../services/notificationService';
import OrderStatusTracker from '../../components/OrderStatusTracker'; // Import the new component

const CustomerOrdersScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const { orders: allOrders } = useData();
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

    const myOrders = useMemo(() => {
        if (!currentUser) return [];
        return allOrders
            .filter(order => order.customerId === currentUser.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [currentUser, allOrders]);

    const handleRateSubmit = (rating: number, feedback: string) => {
      if (!currentUser || !ratingOrder) return;
      updateOrder({ ...ratingOrder, rating, feedback }, currentUser);
      notificationService.notify({
        title: 'Thank you!',
        message: 'Your review has been submitted successfully.',
        type: 'success',
      });
      setRatingOrder(null);
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-gray-100 mb-8">My Orders</h1>
            
            <div className="space-y-6">
                {myOrders.length > 0 ? myOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                           <div>
                                <p className="font-bold text-xl text-gray-100">Order #{order.id.slice(-4)}</p>
                                <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                           </div>
                           <div className="mt-2 sm:mt-0 text-right">
                               <p className="font-bold text-xl text-gray-100">₹{order.total.toFixed(2)}</p>
                               <p className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 ${order.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                   {order.paymentStatus} {order.paymentMethod && `(${order.paymentMethod})`}
                               </p>
                           </div>
                        </div>
                        <div className="my-6">
                            <OrderStatusTracker status={order.status} type={order.type} />
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Items:</h4>
                            <ul className="space-y-1 text-sm text-gray-300">
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{item.quantity}x {item.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end items-center mt-4">
                                {order.status === OrderStatus.DELIVERED && !order.rating && (
                                    <button
                                        onClick={() => setRatingOrder(order)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                                    >
                                        Rate Delivery
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">You haven't placed any orders yet.</p>
                )}
            </div>

            {ratingOrder && (
                <RatingModal 
                    order={ratingOrder}
                    onClose={() => setRatingOrder(null)}
                    onSubmit={handleRateSubmit}
                />
            )}
        </div>
    );
};

export default CustomerOrdersScreen;