
import React from 'react';
// FIX: Added content for CredentialsModal component and corrected import paths.
import { CloseIcon } from './Icons';

interface CredentialsModalProps {
  credentials: {
    email: string;
    password: string;
  };
  onClose: () => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ credentials, onClose }) => {

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a small notification "Copied!"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Staff Account Created</h3>
          <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Please share these credentials with the new staff member. They will be required to change their password on first login.</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
              <div className="flex items-center">
                <input type="text" readOnly value={credentials.email} className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded-l-md" />
                <button onClick={() => handleCopy(credentials.email)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-r-md">Copy</button>
              </div>
            </div>
             <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Temporary Password</label>
              <div className="flex items-center">
                <input type="text" readOnly value={credentials.password} className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded-l-md" />
                <button onClick={() => handleCopy(credentials.password)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-r-md">Copy</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
