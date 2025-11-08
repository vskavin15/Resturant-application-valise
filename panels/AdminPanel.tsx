import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth';
import { Role, Screen } from '../types';
import { getSocket } from '../services/socketService';
import { notificationService } from '../services/notificationService';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardScreen from '../screens/DashboardScreen';
// FIX: Corrected import path for UsersScreen.
import UsersScreen from '../screens/UsersScreen';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TableManagementScreen from '../screens/TableManagementScreen';
import KitchenDisplayScreen from '../screens/KitchenDisplayScreen';
import ModifiersScreen from '../screens/ModifiersScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import IngredientsScreen from '../screens/IngredientsScreen';
import StaffScheduleScreen from '../screens/StaffScheduleScreen';
import MenuIntelligenceScreen from '../screens/MenuIntelligenceScreen';


const socket = getSocket();

const screenPermissions: Record<Role, Screen[]> = {
    [Role.ADMIN]: [Screen.DASHBOARD, Screen.USERS, Screen.STAFF_SCHEDULE, Screen.MENU, Screen.MENU_INTELLIGENCE, Screen.INGREDIENTS, Screen.MODIFIERS, Screen.ORDERS, Screen.RESERVATIONS, Screen.ANALYTICS, Screen.TABLES, Screen.KDS],
    [Role.CASHIER]: [], 
    [Role.SERVER]: [],
    [Role.KITCHEN]: [],
    [Role.DELIVERY_PARTNER]: [],
    [Role.CUSTOMER]: [],
};

const AdminPanel: React.FC = () => {
    const { currentUser } = useAuth();
    
    const allowedScreens = useMemo(() => {
        return currentUser ? screenPermissions[currentUser.role] : [];
    }, [currentUser]);

    const [activeScreen, setActiveScreen] = useState<Screen>(allowedScreens[0] || Screen.DASHBOARD);

    // If allowed screens change and activeScreen is no longer valid, reset it.
    React.useEffect(() => {
        if (allowedScreens.length > 0 && !allowedScreens.includes(activeScreen)) {
            setActiveScreen(allowedScreens[0]);
        }
    }, [allowedScreens, activeScreen]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== Role.ADMIN) return;

        const handleAdminNotification = ({ title, message }: { title: string, message: string }) => {
            notificationService.notify({
                title,
                message,
                type: 'info',
            });
        };

        socket.on('adminNotification', handleAdminNotification);

        return () => {
            socket.off('adminNotification', handleAdminNotification);
        };
    }, [currentUser]);
    
    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.DASHBOARD: return <DashboardScreen />;
            case Screen.USERS: return <UsersScreen />;
            case Screen.STAFF_SCHEDULE: return <StaffScheduleScreen />;
            case Screen.MENU: return <MenuScreen />;
            case Screen.MENU_INTELLIGENCE: return <MenuIntelligenceScreen />;
            case Screen.INGREDIENTS: return <IngredientsScreen />;
            case Screen.MODIFIERS: return <ModifiersScreen />;
            case Screen.ORDERS: return <OrdersScreen />;
            case Screen.RESERVATIONS: return <ReservationsScreen />;
            case Screen.ANALYTICS: return <AnalyticsScreen />;
            // This is a temporary fix until TableManagementScreen is properly integrated
            case Screen.TABLES: return <div><h1 className="text-2xl font-bold">Tables</h1><p>Table management functionality is integrated into the POS panel for Cashiers/Servers.</p></div>;
            case Screen.KDS: return <KitchenDisplayScreen />;
            default: return <DashboardScreen />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} allowedScreens={allowedScreens} />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-900">
                    {renderScreen()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;