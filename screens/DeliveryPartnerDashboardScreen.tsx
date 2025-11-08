import React, { useMemo, useState, useEffect } from 'react';
import { useAuth, updateOrder } from '../auth';
import { Order, OrderStatus, Location, OrderType } from '../types';
import { useData } from '../context/DataContext';
import { MapPinIcon } from '../components/Icons';
import ActiveDeliveryScreen from './ActiveDeliveryScreen'; // Import the new screen

const DeliveryPartnerDashboardScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const { orders: allOrders } = useData();
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    // This effect ensures that the `activeOrder` state is always in sync
    // with the latest data from the global context. This is crucial for
    // seeing status updates reflected in the ActiveDeliveryScreen.
    useEffect(() => {
        if (activeOrder) {
            const updatedOrder = allOrders.find(o => o.id === activeOrder.id);
            // If the order still exists in the main list, update our local state to match it.
            // If not (e.g., it was delivered/cancelled), it will become undefined and we clear the view.
            if (updatedOrder) {
                // To avoid unnecessary re-renders, only update if the status has changed.
                if (updatedOrder.status !== activeOrder.status) {
                    setActiveOrder(updatedOrder);
                }
            } else {
                setActiveOrder(null);
            }
        }
    }, [allOrders, activeOrder]);


    const myOrders = useMemo(() => {
        if (!currentUser) return [];
        return allOrders.filter(order => {
            const isMyActiveOrder = order.deliveryPartnerId === currentUser.id && 
                                    [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY].includes(order.status);
            
            const isAvailableForAcceptance = order.type === OrderType.DELIVERY && 
                                            (order.status === OrderStatus.AWAITING_ACCEPTANCE || 
                                            (order.status === OrderStatus.READY && !order.deliveryPartnerId));

            return isMyActiveOrder || isAvailableForAcceptance;
        }).sort((a, b) => {
            const aIsAvailable = a.status === OrderStatus.AWAITING_ACCEPTANCE || (a.status === OrderStatus.READY && !a.deliveryPartnerId);
            const bIsAvailable = b.status === OrderStatus.AWAITING_ACCEPTANCE || (b.status === OrderStatus.READY && !b.deliveryPartnerId);

            if (aIsAvailable && !bIsAvailable) return -1;
            if (!aIsAvailable && bIsAvailable) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
    }, [currentUser, allOrders]);

    const handleAcceptOrder = (order: Order) => {
        if (!currentUser) return;
        const updatedOrder = { ...order, status: OrderStatus.READY, deliveryPartnerId: currentUser.id };
        updateOrder(updatedOrder, currentUser);
        setActiveOrder(updatedOrder);
    };

    if (activeOrder) {
        return <ActiveDeliveryScreen order={activeOrder} onBack={() => setActiveOrder(null)} />;
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Delivery Hub</h1>

            <div className="space-y-6">
                {myOrders.length > 0 ? myOrders.map(order => {
                    const isAvailable = order.status === OrderStatus.AWAITING_ACCEPTANCE || (order.status === OrderStatus.READY && !order.deliveryPartnerId);

                    return (
                        <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Order #{order.id.slice(-4)} for {order.customerName}</h2>
                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <MapPinIcon className="w-4 h-4 mr-2" />
                                    <span>{order.address || "Address not provided"}</span>
                                </div>
                                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                    {isAvailable ? 'New Request' : order.status}
                                </span>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {isAvailable ? (
                                    <button
                                        onClick={() => handleAcceptOrder(order)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Accept
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setActiveOrder(order)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                                    >
                                        Manage
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-slate-500">No active deliveries or pending orders.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryPartnerDashboardScreen;