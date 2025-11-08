

import React, { useMemo } from 'react';
// FIX: Corrected import paths.
import { User, Order, Role } from '../types';
import { CloseIcon, StarIcon } from './Icons';
import { useData } from '../context/DataContext';

interface CustomerLoyaltyModalProps {
  user: User;
  onClose: () => void;
}

const getTier = (points: number) => {
    if (points >= 100) return { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (points >= 50) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-500/10' };
    if (points > 0) return { name: 'Bronze', color: 'text-yellow-600', bg: 'bg-yellow-600/10' };
    return { name: 'None', color: 'text-gray-500', bg: 'bg-gray-500/10' };
};

const CustomerLoyaltyModal: React.FC<CustomerLoyaltyModalProps> = ({ user, onClose }) => {
  const { orders } = useData();
  
  const purchaseHistory = useMemo(() => {
    if (user.role !== Role.CUSTOMER) return [];
    return orders.filter(o => o.customerId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user, orders]);

  const tier = getTier(user.loyaltyPoints || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Customer Loyalty Profile
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
                <div className="flex-grow">
                    <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${tier.bg}`}>
                    <StarIcon className={`w-8 h-8 mx-auto ${tier.color}`} />
                    <p className={`font-bold text-lg ${tier.color}`}>{user.loyaltyPoints || 0} pts</p>
                    <p className={`text-sm font-semibold ${tier.color}`}>{tier.name} Tier</p>
                </div>
            </div>

            <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Purchase History</h5>
                <div className="max-h-64 overflow-y-auto border dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Order ID</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Total Spent</th>
                                <th scope="col" className="px-6 py-3">Points Earned</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                            {purchaseHistory.length > 0 ? purchaseHistory.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">#{order.id.split('_')[1]}</td>
                                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">₹{order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-semibold text-green-500">+{Math.floor(order.total / 100)} pts</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">No purchase history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerLoyaltyModal;