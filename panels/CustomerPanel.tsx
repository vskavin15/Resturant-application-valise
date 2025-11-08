import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { useAuth } from '../auth';
import { getSocket } from '../services/socketService';
import { notificationService } from '../services/notificationService';

import CustomerHeader from '../components/CustomerHeader';
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import CustomerMenuScreen from '../screens/customer/CustomerMenuScreen';
import CustomerOrdersScreen from '../screens/customer/CustomerOrdersScreen';
import CustomerReservationsScreen from '../screens/customer/CustomerReservationsScreen';
import { CartProvider } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import ItemCustomizationModal from '../components/ItemCustomizationModal';

const socket = getSocket();

const CustomerPanel: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.CUSTOMER_DASHBOARD);

    useEffect(() => {
        const handleOrderReady = ({ orderId, customerId }: { orderId: string, customerId: string }) => {
            if (currentUser && currentUser.id === customerId) {
                notificationService.notify({
                    title: 'Order Ready!',
                    message: `Your Takeaway order #${orderId.slice(-4)} is now ready for pickup.`,
                    type: 'success',
                });
            }
        };

        const handleReservationUpdate = ({ customerId, message }: { customerId: string, message: string }) => {
            if (currentUser && currentUser.id === customerId) {
                notificationService.notify({
                    title: 'Reservation Update',
                    message,
                    type: 'info',
                });
            }
        };

        socket.on('orderReadyForPickup', handleOrderReady);
        socket.on('reservationUpdated', handleReservationUpdate);

        return () => {
            socket.off('orderReadyForPickup', handleOrderReady);
            socket.off('reservationUpdated', handleReservationUpdate);
        };
    }, [currentUser]);

    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.CUSTOMER_ORDERS:
                return <CustomerOrdersScreen />;
            case Screen.CUSTOMER_MENU:
                return <CustomerMenuScreen />;
            case Screen.CUSTOMER_RESERVATIONS:
                return <CustomerReservationsScreen />;
            case Screen.CUSTOMER_DASHBOARD:
            default:
                return <CustomerDashboardScreen />;
        }
    };

    return (
        <CartProvider>
            <div className="min-h-screen bg-gray-900 text-gray-200">
                <CustomerHeader activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
                <main className="p-4 md:p-6 lg:p-8">
                    {renderScreen()}
                </main>
                <CartDrawer />
                <ItemCustomizationModal />
            </div>
        </CartProvider>
    );
};

export default CustomerPanel;