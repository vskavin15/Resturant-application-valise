import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Reservation, ReservationStatus } from '../types';
import { useAuth, updateReservationStatus } from '../auth';

type Tab = 'Pending' | 'Confirmed' | 'All';

const getStatusColor = (status: ReservationStatus) => {
    switch(status) {
        case ReservationStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case ReservationStatus.CONFIRMED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case ReservationStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case ReservationStatus.COMPLETED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
}


const ReservationsScreen: React.FC = () => {
    const { reservations } = useData();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('Pending');

    const filteredReservations = useMemo(() => {
        const sorted = [...reservations].sort((a,b) => new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime());
        if (activeTab === 'All') return sorted;
        return sorted.filter(r => r.status === activeTab);
    }, [reservations, activeTab]);
    
    const handleUpdateStatus = (reservationId: string, status: ReservationStatus) => {
        if (currentUser) {
            updateReservationStatus(reservationId, status, currentUser);
        }
    };

    return (
        <div className="container mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Reservations</h1>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['Pending', 'Confirmed', 'All'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                ? 'border-amber-500 text-amber-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                <div className="w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <table className="w-full whitespace-no-wrap">
                        <thead>
                            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-900">
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Date & Time</th>
                                <th className="px-4 py-3">Table</th>
                                <th className="px-4 py-3">Party Size</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                            {filteredReservations.map(res => (
                                <tr key={res.id} className="text-gray-700 dark:text-gray-400">
                                    <td className="px-4 py-3 font-semibold">{res.customerName}</td>
                                    <td className="px-4 py-3">{new Date(res.reservationTime).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">{res.tableNumber}</td>
                                    <td className="px-4 py-3 text-center">{res.partySize}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${getStatusColor(res.status)}`}>{res.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {res.status === ReservationStatus.PENDING && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleUpdateStatus(res.id, ReservationStatus.CONFIRMED)} className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200">Confirm</button>
                                                <button onClick={() => handleUpdateStatus(res.id, ReservationStatus.CANCELLED)} className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200">Cancel</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReservationsScreen;
