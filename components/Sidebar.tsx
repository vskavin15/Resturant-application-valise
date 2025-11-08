import React from 'react';
// FIX: Corrected import paths.
import { Screen, Role } from '../types';
// FIX: Import ClockIcon to resolve 'Cannot find name' error.
import { DashboardIcon, UsersIcon, MenuIcon, OrdersIcon, AnalyticsIcon, LogoutIcon, TableCellsIcon, FireIcon, ClipboardListIcon, UsersGroupIcon, ChartBarIcon, ClockIcon, LightbulbIcon, RestaurantIcon } from './Icons';
import { useAuth } from '../auth';

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  allowedScreens: Screen[];
}

const NavItem: React.FC<{
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  activeScreen: Screen;
  onClick: (screen: Screen) => void;
}> = ({ screen, label, icon, activeScreen, onClick }) => {
  const isActive = activeScreen === screen;
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick(screen);
        }}
        className={`flex items-center p-3 text-base font-medium rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        {icon}
        <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen, allowedScreens }) => {
  const { logout, currentUser } = useAuth();
  
  const allNavItems = [
    { screen: Screen.DASHBOARD, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { screen: Screen.CASHIER_DASHBOARD, label: 'Cashier Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { screen: Screen.DELIVERY_DASHBOARD, label: 'My Deliveries', icon: <OrdersIcon className="w-6 h-6" /> },
    { screen: Screen.RESERVATIONS, label: 'Reservations', icon: <UsersGroupIcon className="w-6 h-6" /> },
    { screen: Screen.TABLES, label: 'Table Management', icon: <TableCellsIcon className="w-6 h-6" /> },
    { screen: Screen.KDS, label: 'Kitchen Display', icon: <FireIcon className="w-6 h-6" /> },
    { screen: Screen.USERS, label: 'User & Staff', icon: <UsersIcon className="w-6 h-6" /> },
    { screen: Screen.STAFF_SCHEDULE, label: 'Staff Schedule', icon: <ClockIcon className="w-6 h-6" /> },
    { screen: Screen.MENU, label: 'Menu Items', icon: <MenuIcon className="w-6 h-6" /> },
    { screen: Screen.MENU_INTELLIGENCE, label: 'Menu Intelligence', icon: <LightbulbIcon className="w-6 h-6" /> },
    { screen: Screen.INGREDIENTS, label: 'Ingredients', icon: <ChartBarIcon className="w-6 h-6" /> },
    { screen: Screen.MODIFIERS, label: 'Menu Modifiers', icon: <ClipboardListIcon className="w-6 h-6" /> },
    { screen: Screen.ORDERS, label: 'Order Hub', icon: <OrdersIcon className="w-6 h-6" /> },
    { screen: Screen.ANALYTICS, label: 'Analytics & BI', icon: <AnalyticsIcon className="w-6 h-6" /> },
  ];

  const navItems = allNavItems.filter(item => allowedScreens.includes(item.screen));

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen" aria-label="Sidebar">
      <div className="flex-1 px-3 py-4 overflow-y-auto bg-gray-800">
        <div className="flex items-center pl-2.5 mb-5">
            <RestaurantIcon className="w-8 h-8 mr-2 text-amber-500"/>
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">FlavorFlow</span>
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.screen}
              screen={item.screen}
              label={item.label}
              icon={item.icon}
              activeScreen={activeScreen}
              onClick={setActiveScreen}
            />
          ))}
        </ul>
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img className="w-10 h-10 rounded-full" src={currentUser?.avatarUrl} alt={currentUser?.name} />
                <div>
                    <p className="font-semibold text-gray-100 text-sm">{currentUser?.name}</p>
                    <p className="text-xs text-gray-400">{currentUser?.role}</p>
                </div>
            </div>
            <button
                onClick={logout}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700"
            >
                <LogoutIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;