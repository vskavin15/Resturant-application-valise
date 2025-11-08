import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { processPayment } from '../services/paymentService';
import { useAuth, addOrder } from '../auth';
import { OrderType, OrderStatus } from '../types';
import { notificationService } from '../services/notificationService';
import { CloseIcon, CreditCardIcon, CashIcon } from './Icons';

interface CheckoutModalProps {
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
    const { cart, clearCart, cartTotal } = useCart();
    const { currentUser } = useAuth();
    const [address, setAddress] = useState(currentUser?.address || '');
    const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderType, setOrderType] = useState<OrderType>(OrderType.DELIVERY);

    const handleCheckout = async (isCod: boolean) => {
        if (!currentUser || cart.length === 0) return;
        
        if (orderType === OrderType.DELIVERY && !address.trim()) {
            notificationService.notify({
                title: 'Address Required',
                message: 'Please enter a delivery address to proceed.',
                type: 'warning'
            });
            return;
        }

        setIsProcessing(true);

        const orderDetails = {
            customerName: currentUser.name,
            customerId: currentUser.id,
            items: cart,
            total: cartTotal,
            type: orderType,
            address: orderType === OrderType.DELIVERY ? address : undefined,
            phoneNumber: orderType === OrderType.DELIVERY ? phoneNumber : undefined,
        };

        try {
            if (isCod) {
                // Cash on Delivery / Pickup
                addOrder({ 
                    ...orderDetails, 
                    status: OrderStatus.AWAITING_ACCEPTANCE,
                    paymentStatus: 'Unpaid',
                    paymentMethod: 'Cash',
                }, currentUser);
                
                notificationService.notify({
                    title: 'Order Placed!',
                    message: 'Your order has been confirmed. You can track its progress in "My Orders".',
                    type: 'success'
                });
            } else {
                // Online Payment
                await processPayment(cartTotal, orderDetails, currentUser);
                addOrder({ 
                    ...orderDetails, 
                    status: OrderStatus.AWAITING_ACCEPTANCE,
                    paymentStatus: 'Paid',
                    paymentMethod: 'Online',
                }, currentUser);

                notificationService.notify({
                    title: 'Payment Successful!',
                    message: 'Your order has been placed and is being prepared.',
                    type: 'success'
                });
            }
            
            clearCart();
            onClose();

        } catch (error) {
            console.error(error);
            notificationService.notify({
                title: isCod ? 'Order Failed' : 'Payment Failed',
                message: (error as Error).message || 'Your request could not be completed.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const inputStyles = "w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b rounded-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white">
                        Complete Your Order
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                     <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-lg">
                        <button onClick={() => setOrderType(OrderType.DELIVERY)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${orderType === OrderType.DELIVERY ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}>
                            Delivery
                        </button>
                        <button onClick={() => setOrderType(OrderType.TAKEOUT)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${orderType === OrderType.TAKEOUT ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}>
                            Takeaway
                        </button>
                    </div>

                    {orderType === OrderType.DELIVERY ? (
                        <>
                            <div>
                                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-300">Delivery Address</label>
                                <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} placeholder="123 Main St, Anytown" required />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-300">Phone Number (Optional)</label>
                                <input type="tel" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={inputStyles} placeholder="For delivery updates" />
                            </div>
                        </>
                    ) : (
                         <div className="p-3 bg-blue-900/50 rounded-lg text-center text-sm text-blue-300">
                            You'll be notified when your order is ready for pickup.
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-100">
                            <span>Total to Pay:</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-gray-700 rounded-b-xl overflow-hidden">
                    <button
                        onClick={() => handleCheckout(false)}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-full p-4 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400"
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Processing...' : 'Pay Online'}
                    </button>
                    <button
                        onClick={() => handleCheckout(true)}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-full p-4 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500"
                    >
                        <CashIcon className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Processing...' : (orderType === OrderType.DELIVERY ? 'Cash on Delivery' : 'Pay at Counter')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;