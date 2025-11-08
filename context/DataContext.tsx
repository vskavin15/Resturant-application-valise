import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order, MenuItem, Shift, ActivityLog, Table, Reservation, ModifierGroup, Ingredient, StaffSchedule } from '../types';
import './../services/mock-socket-server'; // This will initialize and monkey-patch the server. MUST BE FIRST.
import { getSocket } from '../services/socketService';


interface DataContextType {
    users: User[];
    orders: Order[];
    menuItems: MenuItem[];
    shifts: Shift[];
    activityLog: ActivityLog[];
    tables: Table[];
    reservations: Reservation[];
    modifierGroups: ModifierGroup[];
    ingredients: Ingredient[];
    staffSchedules: StaffSchedule[];
    isConnected: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialState: DataContextType = {
    users: [],
    orders: [],
    menuItems: [],
    shifts: [],
    activityLog: [],
    tables: [],
    reservations: [],
    modifierGroups: [],
    ingredients: [],
    staffSchedules: [],
    isConnected: false,
};

const socket = getSocket();

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DataContextType>(initialState);

    useEffect(() => {
        // Manually connect the socket when the provider mounts
        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected!');
            setData(prev => ({ ...prev, isConnected: true }));
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected!');
            setData(prev => ({ ...prev, isConnected: false }));
        });
        
        socket.on('dataUpdate', (serverData: Omit<DataContextType, 'isConnected'>) => {
            setData(prev => ({ ...prev, ...serverData }));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('dataUpdate');
            socket.disconnect();
        };
    }, []);

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
