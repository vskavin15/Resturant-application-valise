import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth, saveSchedule, deleteSchedule } from '../auth';
import { StaffSchedule, User, Role } from '../types';
import { CloseIcon, TrashIcon } from '../components/Icons';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// A very basic scheduler modal
const ScheduleModal: React.FC<{
    onClose: () => void;
    staffList: User[];
}> = ({ onClose, staffList }) => {
    const { currentUser } = useAuth();
    const [staffId, setStaffId] = useState(staffList[0]?.id || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !staffId) return;
        const newSchedule: StaffSchedule = {
            id: `sched_${Date.now()}`,
            staffId,
            start: new Date(`${date}T${startTime}`).toISOString(),
            end: new Date(`${date}T${endTime}`).toISOString(),
        };
        saveSchedule(newSchedule, currentUser);
        onClose();
    };

    const inputStyles = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600";


    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <form className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 className="text-xl font-semibold">Add Shift</h3>
                    <button type="button" onClick={onClose} className="p-1.5"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <select value={staffId} onChange={e => setStaffId(e.target.value)} className={inputStyles}>
                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                    </select>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputStyles} />
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputStyles} />
                    </div>
                </div>
                <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Add to Schedule</button>
                </div>
            </form>
        </div>
    );
}

const StaffScheduleScreen: React.FC = () => {
    const { users, staffSchedules } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const staff = users.filter(u => u.role !== Role.ADMIN && u.role !== Role.CUSTOMER);
    
    // This is a simple weekly view. A real app would use a date library.
    const weekSchedules = staffSchedules.filter(s => {
        const schedDate = new Date(s.start);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
        return schedDate >= startOfWeek && schedDate <= endOfWeek;
    });

    const handleDelete = (scheduleId: string) => {
        if(currentUser) deleteSchedule(scheduleId, currentUser);
    }
    
    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Staff Schedule</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Add Shift</button>
            </div>
            <div className="w-full overflow-hidden rounded-lg shadow-sm border dark:border-gray-700">
                <div className="grid grid-cols-7">
                    {daysOfWeek.map((day, dayIndex) => (
                        <div key={day} className="border-r dark:border-gray-700">
                            <h3 className="text-center font-bold p-2 bg-gray-50 dark:bg-gray-900">{day}</h3>
                            <div className="p-2 space-y-2 min-h-[60vh]">
                                {weekSchedules.filter(s => new Date(s.start).getDay() === (dayIndex + 1) % 7).map(s => {
                                    const staffMember = users.find(u => u.id === s.staffId);
                                    return (
                                        <div key={s.id} className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md text-xs relative group">
                                            <p className="font-bold text-blue-800 dark:text-blue-200">{staffMember?.name}</p>
                                            <p className="text-blue-600 dark:text-blue-300">
                                                {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <button onClick={() => handleDelete(s.id)} className="absolute top-1 right-1 p-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100">
                                                <TrashIcon className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} staffList={staff} />}
        </div>
    );
};

export default StaffScheduleScreen;
