import React, { useState } from 'react';
import { processPayment } from '../services/paymentService';
import { useAuth } from '../auth';
import { Order } from '../types';
import { notificationService } from '../services/notificationService';
import { CloseIcon, CashIcon, CreditCardIcon, SparklesIcon } from './Icons';

interface PaymentModalProps {
  orderTotal: number;
  orderDetails: Partial<Order>;
  onClose: () => void;
  onPaymentSuccess: (method: 'Cash' | 'Card' | 'Online') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ orderTotal, orderDetails, onClose, onPaymentSuccess }) => {
    const { currentUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleOnlinePayment = async () => {
        if (!currentUser) return;
        setIsProcessing(true);
        try {
            await processPayment(orderTotal, orderDetails, currentUser);
            onPaymentSuccess('Online');
        } catch (error) {
            notificationService.notify({
                title: 'Payment Failed',
                message: (error as Error).message,
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Process Payment
                  </h3>
                  <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Total Amount Due</p>
                    <p className="text-5xl font-bold text-gray-800 dark:text-gray-100 my-4">₹{orderTotal.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Select Payment Method</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button disabled={isProcessing} onClick={() => onPaymentSuccess('Cash')} className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg border-2 border-green-200 dark:border-green-700 transition-colors disabled:opacity-50">
                            <CashIcon className="w-8 h-8 text-green-600 dark:text-green-400 mb-2"/>
                            <span className="font-semibold text-green-700 dark:text-green-300">Cash</span>
                        </button>
                        <button disabled={isProcessing} onClick={() => onPaymentSuccess('Card')} className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg border-2 border-blue-200 dark:border-blue-700 transition-colors disabled:opacity-50">
                            <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2"/>
                            <span className="font-semibold text-blue-700 dark:text-blue-300">Card</span>
                        </button>
                         <button disabled={isProcessing} onClick={handleOnlinePayment} className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700 transition-colors disabled:opacity-50">
                            <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2"/>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">{isProcessing ? 'Processing...' : 'Online'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;