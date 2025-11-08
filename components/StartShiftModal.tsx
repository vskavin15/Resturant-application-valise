
import React, { useState } from 'react';
// FIX: Import useAuth to get the current user for action logging. Corrected import path.
import { startShift, useAuth } from '../auth';
import { CloseIcon, CalculatorIcon } from './Icons';

interface StartShiftModalProps {
    cashierId: string;
    onClose: () => void;
}

const StartShiftModal: React.FC<StartShiftModalProps> = ({ cashierId, onClose }) => {
    const [startFloat, setStartFloat] = useState('');
    const [error, setError] = useState('');
    // FIX: Get currentUser to pass as actor.
    const { currentUser } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const floatValue = parseFloat(startFloat);
        if (isNaN(floatValue) || floatValue < 0) {
            setError('Please enter a valid starting float amount.');
            return;
        }
        try {
            // FIX: Pass currentUser as the third argument to startShift.
            if (currentUser) startShift(cashierId, floatValue, currentUser);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
                           <CalculatorIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Start Shift
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="startFloat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Starting Cash Float (₹)</label>
                            <input
                                type="number"
                                id="startFloat"
                                value={startFloat}
                                onChange={e => setStartFloat(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="e.g., 150.00"
                                required
                                min="0"
                                step="0.01"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-500/50">
                            Start Shift & Clock In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartShiftModal;