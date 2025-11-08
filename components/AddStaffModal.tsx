import React, { useState } from 'react';
// FIX: Added content for AddStaffModal component and corrected import paths.
import { Role } from '../types';
import { CloseIcon } from './Icons';

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (name: string, email: string, role: Role, hourlyRate: number) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.SERVER);
  const [hourlyRate, setHourlyRate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(hourlyRate);
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }
    if (isNaN(rate) || rate < 0) {
        setError('Please enter a valid hourly rate.');
        return;
    }
    setError('');
    onAdd(name, email, role, rate);
  };
  
  const inputStyles = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Staff Member</h3>
          <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                  <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className={inputStyles}>
                    {Object.values(Role).filter(r => r !== Role.ADMIN && r !== Role.CUSTOMER).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                 <div>
                  <label htmlFor="hourlyRate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hourly Rate (₹)</label>
                  <input type="number" id="hourlyRate" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} className={inputStyles} required min="0" />
                </div>
            </div>
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/50">
              Add Staff & Generate Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
