import React, { useState, useMemo } from 'react';
import { useAuth, createReservation } from '../../auth';
import { useData } from '../../context/DataContext';
import { ReservationStatus } from '../../types';

const getStatusColor = (status: ReservationStatus) => {
    switch(status) {
        case ReservationStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case ReservationStatus.CONFIRMED: return 'bg-green-100 text-green-800';
        case ReservationStatus.CANCELLED: return 'bg-red-100 text-red-800';
        case ReservationStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
    }
}

const CustomerReservationsScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const { reservations: allReservations } = useData();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('19:00');
    const [partySize, setPartySize] = useState(2);
    const [tableNumber, setTableNumber] = useState(1);

    const myReservations = useMemo(() => {
        if (!currentUser) return [];
        return allReservations
            .filter(r => r.customerId === currentUser.id)
            .sort((a,b) => new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime());
    }, [currentUser, allReservations]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const reservationTime = new Date(`${date}T${time}`).toISOString();
        createReservation({
            customerId: currentUser.id,
            tableNumber,
            reservationTime,
            partySize
        }, currentUser);
    };
    
    const inputStyles = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4">Make a Reservation</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputStyles} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Party Size</label>
                            <input type="number" value={partySize} onChange={e => setPartySize(parseInt(e.target.value))} min="1" max="12" className={inputStyles} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Preferred Table (optional)</label>
                            <input type="number" value={tableNumber} onChange={e => setTableNumber(parseInt(e.target.value))} min="1" max="12" className={inputStyles} />
                        </div>
                        <button type="submit" className="w-full py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700">Request Reservation</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                 <h2 className="text-2xl font-bold mb-4">Your Reservations</h2>
                 <div className="space-y-4">
                    {myReservations.length > 0 ? myReservations.map(res => (
                         <div key={res.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-amber-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">Table {res.tableNumber} for {res.partySize} people</p>
                                    <p className="text-sm text-gray-500">{new Date(res.reservationTime).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(res.status)}`}>{res.status}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-8">You have no reservations.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default CustomerReservationsScreen;
