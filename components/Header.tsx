import React, { useState } from 'react';
// FIX: Corrected import paths.
import { useAuth, useActiveShift } from '../auth';
import { Role } from '../types';
import { ClockIcon, LogoutIcon } from './Icons';
import StartShiftModal from './StartShiftModal';
import EndShiftModal from './EndShiftModal';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isStartShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [isEndShiftModalOpen, setEndShiftModalOpen] = useState(false);

  const activeShift = useActiveShift(currentUser?.id);

  const handleToggleStatus = () => {
      if (!currentUser || currentUser.role !== Role.CASHIER) return;
      
      if (activeShift) {
          setEndShiftModalOpen(true);
      } else {
          setStartShiftModalOpen(true);
      }
  };

  return (
    <header className="relative z-10 py-3 bg-gray-800 shadow-md">
      <div className="container flex items-center justify-end h-full px-6 mx-auto">
        <ul className="flex items-center flex-shrink-0 space-x-6">
          {currentUser?.role === Role.CASHIER && (
            <li>
                <button 
                    onClick={handleToggleStatus}
                    className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 transition-colors duration-200 ${
                        activeShift 
                        ? 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500'
                        : 'bg-gray-600 text-gray-100 hover:bg-gray-500 focus:ring-gray-400'
                    }`}
                >
                    <ClockIcon className="w-4 h-4 mr-2" />
                    {activeShift ? 'Clock Out' : 'Clock In'}
                </button>
            </li>
          )}
          <li className="relative">
            {currentUser && (
              <div className="flex items-center align-middle">
                <img className="object-cover w-10 h-10 rounded-full" src={currentUser.avatarUrl} alt="User Avatar" aria-hidden="true" />
                <div className="ml-3 hidden md:block text-right">
                    <p className="font-semibold text-gray-100">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.role}</p>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
      {isStartShiftModalOpen && currentUser && (
        <StartShiftModal 
            cashierId={currentUser.id}
            onClose={() => setStartShiftModalOpen(false)} 
        />
      )}
      {isEndShiftModalOpen && activeShift && (
        <EndShiftModal
            shift={activeShift}
            onClose={() => setEndShiftModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;