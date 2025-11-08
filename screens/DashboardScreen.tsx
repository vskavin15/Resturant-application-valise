import React from 'react';
import DashboardCard from '../components/DashboardCard';
// FIX: Corrected import paths.
import { OrderStatus } from '../types';
import AnalyticsScreen from './AnalyticsScreen';
import LiveTrackingMap from '../components/LiveTrackingMap';
import ActivityLog from '../components/ActivityLog';
import { GlobeIcon, BellIcon } from '../components/Icons';
import { useData } from '../context/DataContext';
import AskAiWidget from '../components/AskAiWidget';

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const CurrencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v.01M12 12v-1m0-1V8m0 0v.01M12 16v-1m0-1v-1m0 0v.01M12 16v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c-1.657 0-3-.895-3-2s1.343 2 3-2m0 8c1.657 0 3-.895 3-2s-1.343-2-3-2m0 0c-1.11 0-2.08.402-2.599-1M12 4v1m0 14v1m-6.4-2.599A8.963 8.963 0 013.512 12C3.512 7.822 6.883 4.45 11 4.45c.486 0 .958.044 1.423.125m3.174 8.828A8.963 8.963 0 0118.488 12c0 4.178-3.372 7.55-7.488 7.55-1.487 0-2.87-.44-4.077-1.175" /></svg>
);
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
);
const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);


const DashboardScreen: React.FC = () => {
  const { orders, users, menuItems } = useData();

  const totalRevenue = orders.filter(o => o.status === OrderStatus.DELIVERED).reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(o.status)).length;
  const onlineStaff = users.filter(u => u.status === 'Online').length;
  const lowStockItems = menuItems.filter(item => item.stock < 15).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
      <p className="text-gray-400 mt-1">Here's a summary of today's activity.</p>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4 mt-6">
        <DashboardCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toFixed(2)}`} 
          icon={<CurrencyIcon className="w-8 h-8"/>}
          change="12.5%"
          changeType="increase"
          color="green"
        />
        <DashboardCard 
          title="Active Orders" 
          value={activeOrders.toString()} 
          icon={<ClipboardIcon className="w-8 h-8"/>}
          change="2.1%"
          changeType="decrease"
          color="blue"
        />
        <DashboardCard 
          title="Staff Online" 
          value={`${onlineStaff} / ${users.length}`} 
          icon={<UsersIcon className="w-8 h-8"/>}
          color="yellow"
        />
        <DashboardCard 
          title="Low Stock Items" 
          value={lowStockItems.toString()} 
          icon={<ExclamationIcon className="w-8 h-8"/>}
          color="red"
        />
      </div>

      <div className="my-8">
          <AskAiWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <GlobeIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Live Delivery Partner Tracking</h2>
            </div>
            <LiveTrackingMap />
        </div>
        <div className="lg:col-span-1 p-6 bg-gray-800 rounded-lg shadow-lg">
             <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <BellIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Live Activity</h2>
            </div>
            <ActivityLog />
        </div>
      </div>

      <div className="mt-8">
        <AnalyticsScreen />
      </div>
    </div>
  );
};

export default DashboardScreen;