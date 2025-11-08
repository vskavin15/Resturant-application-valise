import React, { useState } from 'react';
import { Order } from '../types';
import { useAuth } from '../auth';
import { processPayment } from '../services/paymentService';
import { CloseIcon, CashIcon, QrCodeIcon } from './Icons';

interface ConfirmPaymentModalProps {
    order: Order;
    onClose: () => void;
    onConfirm: (method: 'Cash' | 'Online') => void;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({ order, onClose, onConfirm }) => {
    const { currentUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleOnlinePayment = async () => {
        if (!currentUser) return;
        setIsProcessing(true);
        try {
            await processPayment(order.total, order, currentUser);
            onConfirm('Online');
        } catch (error) {
            // Notification is handled inside processPayment service
        } finally {
            setIsProcessing(false);
            onClose(); // Close modal on success or failure of payment attempt
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Finalize Payment
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Total amount to be collected:</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 my-4">
                        ₹{order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">How did the customer pay?</p>
                </div>

                <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
                    <button
                        onClick={() => onConfirm('Cash')}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-full p-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                    >
                        <CashIcon className="w-5 h-5 mr-2" />
                        <span>Paid in Cash</span>
                    </button>
                    <button
                        onClick={handleOnlinePayment}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-full p-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        <QrCodeIcon className="w-5 h-5 mr-2" />
                        <span>{isProcessing ? 'Processing...' : 'Pay via UPI/Card'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPaymentModal;