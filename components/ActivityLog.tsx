

import React from 'react';
// FIX: Corrected import paths.
import { useData } from '../context/DataContext';
import { Role } from '../types';

const ActivityLog: React.FC = () => {
    const { activityLog } = useData();
    const logs = activityLog.slice(0, 10);

    const getRoleColor = (role: Role) => {
        switch (role) {
            case Role.ADMIN: return 'text-amber-500';
            case Role.CASHIER: return 'text-green-500';
            case Role.SERVER: return 'text-blue-500';
            case Role.DELIVERY_PARTNER: return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="h-full max-h-96 overflow-y-auto">
            <ul className="space-y-4">
                {logs.map(log => (
                    <li key={log.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400">
                                {log.actor.name.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                <span className={`font-semibold ${getRoleColor(log.actor.role)}`}>{log.actor.name}</span> {log.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </li>
                ))}
                {logs.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 pt-8">No recent activity.</p>
                )}
            </ul>
        </div>
    );
};

export default ActivityLog;