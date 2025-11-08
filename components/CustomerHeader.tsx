import React from 'react';
import { useAuth } from '../auth';
import { Screen } from '../types';
import { RestaurantIcon, LogoutIcon, DashboardIcon, MenuIcon, OrdersIcon, UsersGroupIcon } from './Icons';

interface CustomerHeaderProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const NavLink: React.FC<{
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  activeScreen: Screen;
  onClick: (screen: Screen) => void;
}> = ({ screen, label, icon, activeScreen, onClick }) => {
    const isActive = activeScreen === screen;
    return (
        <button
            onClick={() => onClick(screen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive 
                ? 'bg-amber-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    )
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ activeScreen, setActiveScreen }) => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="sticky top-0 z-20 py-3 px-4 md:px-6 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <RestaurantIcon className="w-8 h-8 text-amber-500" />
                    <span className="text-2xl font-bold text-white hidden sm:inline">FlavorFlow</span>
                </div>

                <nav className="flex items-center space-x-1 sm:space-x-2 bg-gray-900 p-1 rounded-lg">
                   <NavLink screen={Screen.CUSTOMER_DASHBOARD} label="Dashboard" icon={<DashboardIcon className="w-5 h-5" />} activeScreen={activeScreen} onClick={setActiveScreen} />
                   <NavLink screen={Screen.CUSTOMER_MENU} label="Menu" icon={<MenuIcon className="w-5 h-5" />} activeScreen={activeScreen} onClick={setActiveScreen} />
                   <NavLink screen={Screen.CUSTOMER_RESERVATIONS} label="Reservations" icon={<UsersGroupIcon className="w-5 h-5" />} activeScreen={activeScreen} onClick={setActiveScreen} />
                   <NavLink screen={Screen.CUSTOMER_ORDERS} label="My Orders" icon={<OrdersIcon className="w-5 h-5" />} activeScreen={activeScreen} onClick={setActiveScreen} />
                </nav>

                <div className="flex items-center space-x-4">
                    {currentUser && (
                        <div className="flex items-center space-x-2">
                            <img className="w-10 h-10 rounded-full object-cover" src={currentUser.avatarUrl} alt={currentUser.name} />
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-100">{currentUser.name}</p>
                                <p className="text-xs text-gray-400">Customer</p>
                            </div>
                        </div>
                    )}
                    <button onClick={logout} className="p-2 rounded-lg text-gray-400 hover:bg-gray-700">
                       <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default CustomerHeader;