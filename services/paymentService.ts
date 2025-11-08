import { User, Order } from '../types';
import { notificationService } from './notificationService';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const processPayment = (
    orderAmount: number,
    orderDetails: Partial<Order>,
    currentUser: User
): Promise<{ payment_id: string }> => {
    return new Promise((resolve, reject) => {
        if (typeof window.Razorpay === 'undefined') {
            const errorMsg = 'Razorpay SDK not loaded. Please check your internet connection.';
            notificationService.notify({ title: 'Payment Error', message: errorMsg, type: 'error' });
            return reject(new Error(errorMsg));
        }

        if (typeof orderAmount !== 'number' || orderAmount <= 0) {
            const errorMsg = 'Invalid order total for payment.';
            notificationService.notify({ title: 'Payment Error', message: errorMsg, type: 'error' });
            return reject(new Error('Invalid payment amount.'));
        }

        const options = {
            key: 'rzp_test_ILgsfZCZoFIe_x', // A standard, working test key
            amount: orderAmount * 100, // Amount in paise
            currency: 'INR',
            name: 'RMS Inc.',
            description: `Order for ${orderDetails.customerName}`,
            image: 'https://picsum.photos/seed/rmslogo/200/200',
            handler: (response: any) => {
                resolve({ payment_id: response.razorpay_payment_id });
            },
            prefill: {
                name: currentUser.name,
                email: currentUser.email,
                contact: currentUser.phoneNumber || '',
            },
            notes: {
                address: orderDetails.address || currentUser.address || 'Restaurant Address',
            },
            theme: {
                color: '#d97706', // App's amber color
            },
            modal: {
                ondismiss: () => {
                    // This callback is executed when the user closes the modal
                    reject(new Error('Payment window closed.'));
                }
            }
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
            console.error('Razorpay Payment Failed:', response.error);
            notificationService.notify({
                title: 'Payment Failed',
                message: response.error.description || 'An unknown error occurred.',
                type: 'error'
            });
            reject(new Error(response.error.reason || 'Payment failed.'));
        });

        rzp.open();
    });
};