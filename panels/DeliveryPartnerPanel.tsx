import React from 'react';
import Header from '../components/Header';
import DeliveryPartnerDashboardScreen from '../screens/DeliveryPartnerDashboardScreen';

const DeliveryPartnerPanel: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-900">
                    <DeliveryPartnerDashboardScreen />
                </main>
            </div>
        </div>
    );
};

export default DeliveryPartnerPanel;