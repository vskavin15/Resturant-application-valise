import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for auth.tsx.
import { AuthProvider, useAuth } from './auth';
import { Role } from './types';
import { DataProvider } from './context/DataContext';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import LocationTracker from './components/LocationTracker';
import NotificationContainer from './components/NotificationContainer';

// Import Panels
import AdminPanel from './panels/AdminPanel';
import CustomerPanel from './panels/CustomerPanel';
import PosPanel from './panels/PosPanel';
import DeliveryPartnerPanel from './panels/DeliveryPartnerPanel';
import KitchenPanel from './panels/KitchenPanel';

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [view, setView] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        if (!currentUser) {
            setView('login');
        }
    }, [currentUser]);

    if (currentUser) {
        switch (currentUser.role) {
            case Role.ADMIN:
                return <AdminPanel />;
            case Role.CASHIER:
            case Role.SERVER:
                return <PosPanel />;
            case Role.DELIVERY_PARTNER:
                return <DeliveryPartnerPanel />;
            case Role.CUSTOMER:
                return <CustomerPanel />;
            case Role.KITCHEN:
                return <KitchenPanel />;
            default:
                // Fallback for any unknown roles or unimplemented panels
                return <LoginScreen onNavigateToSignup={() => setView('signup')} />;
        }
    }

    switch (view) {
        case 'signup':
            return <SignupScreen onNavigateToLogin={() => setView('login')} />;
        case 'login':
        default:
            return <LoginScreen onNavigateToSignup={() => setView('signup')} />;
    }
}

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen">
        <DataProvider>
          <AuthProvider>
            <AppContent />
            <NotificationContainer />
            <LocationTracker />
          </AuthProvider>
        </DataProvider>
    </div>
  );
};

export default App;