import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { useAuth, updateOrder } from '../auth';
import GoogleMapsEmbed from '../components/GoogleMapsEmbed';
import { RESTAURANT_ADDRESS } from '../constants';
import { ArrowLeftIcon, PhoneIcon, NavigationIcon, CheckIcon, CashIcon, RestaurantIcon } from '../components/Icons';
import { notificationService } from '../services/notificationService';
import ConfirmPaymentModal from '../components/ConfirmCashPaymentModal';

interface ActiveDeliveryScreenProps {
    order: Order;
    onBack: () => void;
}

const ActiveDeliveryScreen: React.FC<ActiveDeliveryScreenProps> = ({ order, onBack }) => {
    const { currentUser } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleNavigate = (destination: string) => {
        const origin = currentUser?.location ? `${currentUser.location.lat},${currentUser.location.lng}` : RESTAURANT_ADDRESS;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
        window.open(url, '_blank');
    };
    
    const handlePickupOrder = () => {
        if (!currentUser) return;
        updateOrder({ ...order, status: OrderStatus.OUT_FOR_DELIVERY }, currentUser);
        notificationService.notify({ title: 'Pickup Confirmed', message: `You are now delivering order #${order.id.slice(-4)}.`, type: 'success' });
    };

    const executeOrderCompletion = (paymentMethod: 'Cash' | 'Online' | 'Card' | undefined) => {
        if (!currentUser) return;
        updateOrder({ 
            ...order, 
            status: OrderStatus.DELIVERED,
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod,
        }, currentUser);
        notificationService.notify({ title: 'Delivery Complete!', message: `Order #${order.id.slice(-4)} has been successfully delivered.`, type: 'success' });
        onBack();
    };

    const handleFinalizeDeliveryClick = () => {
        if (!currentUser) return;
        
        if (order.paymentStatus === 'Unpaid') {
            setIsPaymentModalOpen(true);
        } else {
            executeOrderCompletion(order.paymentMethod);
        }
    };

    const handlePaymentConfirmed = (method: 'Cash' | 'Online') => {
        executeOrderCompletion(method);
        setIsPaymentModalOpen(false); // Close the modal
    };


    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-4 bg-white dark:bg-slate-800 shadow-sm flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Delivery for Order #{order.id.slice(-4)}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.status}</p>
                </div>
            </header>
            
            <main className="flex-grow flex flex-col md:flex-row gap-6 p-6 min-h-0">
                <div className="flex-grow md:w-2/3 h-80 md:h-auto rounded-lg overflow-hidden">
                    {order.address ? (
                        <GoogleMapsEmbed destinationAddress={order.address} />
                    ) : (
                         <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">No address to display on map.</p>
                        </div>
                    )}
                </div>

                <div className="md:w-1/3 flex-shrink-0 flex flex-col gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <h2 className="font-bold text-lg mb-2">Customer Details</h2>
                        <p><strong>Name:</strong> {order.customerName}</p>
                        <p><strong>Address:</strong> {order.address}</p>
                        {order.phoneNumber && (
                             <a href={`tel:${order.phoneNumber}`} className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                <PhoneIcon className="w-4 h-4 mr-2" /> Call Customer
                            </a>
                        )}
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <h2 className="font-bold text-lg mb-2">Actions</h2>
                        <div className="space-y-3">
                            {order.status === OrderStatus.READY && (
                                <>
                                    <button onClick={() => handleNavigate(RESTAURANT_ADDRESS)} className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                        <RestaurantIcon className="w-5 h-5 mr-2"/> Navigate to Restaurant
                                    </button>
                                    <button onClick={handlePickupOrder} className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                        <CheckIcon className="w-5 h-5 mr-2"/> Confirm Pickup
                                    </button>
                                </>
                            )}
                             {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                                <>
                                    <button onClick={() => handleNavigate(order.address!)} className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                        <NavigationIcon className="w-5 h-5 mr-2"/> Navigate to Customer
                                    </button>
                                     <button 
                                        onClick={handleFinalizeDeliveryClick} 
                                        className="w-full mt-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center"
                                    >
                                        {order.paymentStatus === 'Unpaid' ? <CashIcon className="w-5 h-5 mr-2" /> : <CheckIcon className="w-5 h-5 mr-2" />}
                                        {order.paymentStatus === 'Unpaid' ? `Finalize Delivery (Collect ₹${order.total.toFixed(2)})` : 'Confirm Delivery'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {isPaymentModalOpen && (
                <ConfirmPaymentModal
                    order={order}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirmed}
                />
            )}
        </div>
    );
};

export default ActiveDeliveryScreen;