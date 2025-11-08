

import React, { useState, useMemo } from 'react';
// FIX: Corrected import paths.
import { Shift } from '../types';
// FIX: Import useAuth to get the current user for action logging.
import { useShiftSummary, endShift, useAuth } from '../auth';
import { CloseIcon, CalculatorIcon } from './Icons';

interface EndShiftModalProps {
    shift: Shift;
    onClose: () => void;
}

const SummaryRow: React.FC<{ label: string; value: string; isBold?: boolean; isFinal?: boolean }> = ({ label, value, isBold, isFinal }) => (
    <div className={`flex justify-between items-center py-2 ${isBold ? 'font-semibold' : ''} ${isFinal ? 'text-lg' : 'text-sm'}`}>
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-gray-900 dark:text-white">{value}</span>
    </div>
);

const EndShiftModal: React.FC<EndShiftModalProps> = ({ shift, onClose }) => {
    const [endFloat, setEndFloat] = useState('');
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    const summary = useShiftSummary(shift);

    const difference = useMemo(() => {
        if (!summary) return null;
        const endFloatValue = parseFloat(endFloat);
        if (isNaN(endFloatValue)) return null;
        return endFloatValue - summary.expectedInDrawer;
    }, [endFloat, summary]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const floatValue = parseFloat(endFloat);
        if (isNaN(floatValue) || floatValue < 0) {
            setError('Please enter a valid ending cash amount.');
            return;
        }
        try {
            if (currentUser) endShift(shift, floatValue, currentUser);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!summary) return null; // Or a loading state

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
                           <CalculatorIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            End Shift Report
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg divide-y dark:divide-gray-600">
                            <SummaryRow label="Shift Start Time" value={new Date(shift.startTime).toLocaleTimeString()} />
                            <SummaryRow label="Starting Float" value={`₹${shift.startFloat.toFixed(2)}`} />
                            <SummaryRow label="Cash Payments" value={`+₹${summary.cashPayments.toFixed(2)}`} />
                            <SummaryRow label="Card Payments" value={`₹${summary.cardPayments.toFixed(2)}`} />
                            <SummaryRow label="Mobile Payments" value={`₹${summary.mobilePayments.toFixed(2)}`} />
                            <SummaryRow label="Tips" value={`₹${summary.tips.toFixed(2)}`} />
                            <SummaryRow label="Expected in Drawer" value={`₹${summary.expectedInDrawer.toFixed(2)}`} isBold isFinal />
                        </div>
                         {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="endFloat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Actual Cash in Drawer (₹)</label>
                            <input
                                type="number"
                                id="endFloat"
                                value={endFloat}
                                onChange={e => setEndFloat(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="e.g., 550.75"
                                required
                                min="0"
                                step="0.01"
                                autoFocus
                            />
                        </div>
                         {difference !== null && (
                            <div className={`p-3 rounded-lg text-center font-bold text-lg ${difference === 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200'}`}>
                                Difference: ₹{difference.toFixed(2)} {difference > 0 ? '(Surplus)' : difference < 0 ? '(Shortage)' : ''}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-500/50">
                            Confirm & Clock Out
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EndShiftModal;