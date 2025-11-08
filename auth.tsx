import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { User, Role, Shift, Order, OrderItem, MenuItem, Location, Table, TableStatus, Reservation, ModifierGroup, Ingredient, StaffSchedule, Reward } from './types';
import { getSocket } from './services/socketService';
import { useData } from './context/DataContext';

// FIX: Added full content for the auth module.

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const socket = getSocket();

// --- OFFLINE QUEUE ---
const OFFLINE_QUEUE_KEY = 'rms-offline-queue';

const getOfflineQueue = (): any[] => {
    try {
        const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch {
        return [];
    }
};

const addToOfflineQueue = (action: any) => {
    const queue = getOfflineQueue();
    queue.push(action);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const clearOfflineQueue = () => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('rms-currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
  });

  useEffect(() => {
    const handleUserUpdate = (updatedUser: User) => {
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
            localStorage.setItem('rms-currentUser', JSON.stringify(updatedUser));
        }
    };

    const processOfflineQueue = () => {
        const queue = getOfflineQueue();
        if (queue.length > 0) {
            console.log(`Processing ${queue.length} offline actions...`);
            queue.forEach(action => {
                socket.emit(action.event, action.data);
            });
            clearOfflineQueue();
        }
    };
    
    // Process queue on initial connection
    socket.on('connect', processOfflineQueue);
    // Also try to process if the browser comes back online
    window.addEventListener('online', processOfflineQueue);

    socket.on('userUpdated', handleUserUpdate);
    return () => {
        socket.off('userUpdated', handleUserUpdate);
        socket.off('connect', processOfflineQueue);
        window.removeEventListener('online', processOfflineQueue);
    };
  }, [currentUser]);

  const login = (email: string, password: string, role: Role): Promise<void> => {
    return new Promise((resolve, reject) => {
        socket.emit('login', { email, password, role }, (response: { success: boolean; user?: User; message?: string }) => {
            if (response.success && response.user) {
                setCurrentUser(response.user);
                localStorage.setItem('rms-currentUser', JSON.stringify(response.user));
                resolve();
            } else {
                reject(new Error(response.message || 'Login failed'));
            }
        });
    });
  };

  const logout = () => {
    if(currentUser) {
        socket.emit('logout', currentUser.id);
    }
    setCurrentUser(null);
    localStorage.removeItem('rms-currentUser');
  };

  const signup = (name: string, email: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        socket.emit('signup', { name, email, password }, (response: { success: boolean; message?: string }) => {
            if (response.success) {
                resolve();
            } else {
                reject(new Error(response.message || 'Signup failed'));
            }
        });
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Data mutation functions
const emitWithActor = (event: string, actor: User, payload: any) => {
    const data = { actor, payload };
    if (socket.connected) {
        socket.emit(event, data);
    } else {
        // Only queue critical offline actions like creating an order
        if (event === 'addOrder') {
            console.log('App is offline. Queuing order.');
            addToOfflineQueue({ event, data });
        } else {
            console.warn(`Cannot perform action '${event}' while offline.`);
        }
    }
};

// User Management
// FIX: Export mutation functions to be used across the application.
export const addStaff = (name: string, email: string, role: Role, hourlyRate: number, actor: User): Promise<{ email: string, password: string }> => {
    return new Promise((resolve, reject) => {
        socket.emit('addStaff', { actor, payload: { name, email, role, hourlyRate } }, (response: { success: boolean; credentials?: { email: string; password: string }, message?: string }) => {
            if (response.success && response.credentials) {
                resolve(response.credentials);
            } else {
                reject(new Error(response.message || 'Failed to add staff'));
            }
        });
    });
};
// FIX: Export mutation functions to be used across the application.
export const updateUser = (user: User, actor: User) => emitWithActor('updateUser', actor, user);
// FIX: Export mutation functions to be used across the application.
export const deleteUser = (userId: string, actor: User) => emitWithActor('deleteUser', actor, userId);
// FIX: Export mutation functions to be used across the application.
export const updateUserLocation = (userId: string, location: Location) => socket.emit('updateUserLocation', { userId, location });
// FIX: Export mutation functions to be used across the application.
export const claimReward = (rewardId: string, actor: User) => emitWithActor('claimReward', actor, rewardId);

// Menu & Inventory Management
// FIX: Export mutation functions to be used across the application.
export const addMenuItem = (item: Omit<MenuItem, 'id'>, actor: User) => emitWithActor('addMenuItem', actor, item);
// FIX: Export mutation functions to be used across the application.
export const updateMenuItem = (item: MenuItem, actor: User) => emitWithActor('updateMenuItem', actor, item);
// FIX: Export mutation functions to be used across the application.
export const deleteMenuItem = (itemId: string, actor: User) => emitWithActor('deleteMenuItem', actor, itemId);
// FIX: Export mutation functions to be used across the application.
export const saveIngredient = (ingredient: Ingredient, actor: User) => emitWithActor('saveIngredient', actor, ingredient);
// FIX: Export mutation functions to be used across the application.
export const deleteIngredient = (ingredientId: string, actor: User) => emitWithActor('deleteIngredient', actor, ingredientId);
// FIX: Export mutation functions to be used across the application.
export const getMenuAnalysis = (actor: User) => emitWithActor('getMenuAnalysis', actor, {});


// Modifier Management
// FIX: Export mutation functions to be used across the application.
export const saveModifierGroup = (modifierGroup: ModifierGroup, actor: User) => emitWithActor('saveModifierGroup', actor, modifierGroup);
// FIX: Export mutation functions to be used across the application.
export const deleteModifierGroup = (modifierGroupId: string, actor: User) => emitWithActor('deleteModifierGroup', actor, modifierGroupId);

// Order Management
// FIX: Export mutation functions to be used across the application.
export const addOrder = (orderData: Partial<Order>, actor: User) => emitWithActor('addOrder', actor, orderData);
// FIX: Export mutation functions to be used across the application.
export const updateOrder = (order: Order, actor: User) => emitWithActor('updateOrder', actor, order);
// FIX: Export mutation functions to be used across the application.
export const recordCashPayment = (orderId: string, actor: User) => emitWithActor('recordCashPayment', actor, orderId);

// Table & Reservation Management
// FIX: Export mutation functions to be used across the application.
export const updateTable = (table: Table) => socket.emit('updateTable', table);
// FIX: Export mutation functions to be used across the application.
export const createReservation = (reservationData: Omit<Reservation, 'id' | 'customerName' | 'status'>, actor: User) => emitWithActor('createReservation', actor, reservationData);
// FIX: Export mutation functions to be used across the application.
export const updateReservationStatus = (reservationId: string, status: Reservation['status'], actor: User) => emitWithActor('updateReservationStatus', actor, { reservationId, status });

// Shift & Schedule Management
// FIX: Export mutation functions to be used across the application.
export const startShift = (cashierId: string, startFloat: number, actor: User) => emitWithActor('startShift', actor, { cashierId, startFloat });
// FIX: Export mutation functions to be used across the application.
export const endShift = (shift: Shift, endFloat: number, actor: User) => emitWithActor('endShift', actor, { shift, endFloat });
// FIX: Export mutation functions to be used across the application.
export const saveSchedule = (schedule: StaffSchedule, actor: User) => emitWithActor('saveSchedule', actor, schedule);
// FIX: Export mutation functions to be used across the application.
export const deleteSchedule = (scheduleId: string, actor: User) => emitWithActor('deleteSchedule', actor, scheduleId);

export const useAuthMutations = () => {
    return { addStaff, updateUser, deleteUser, addMenuItem, updateMenuItem, deleteMenuItem, saveIngredient, deleteIngredient, getMenuAnalysis, saveModifierGroup, deleteModifierGroup, addOrder, updateOrder, recordCashPayment, createReservation, updateReservationStatus, startShift, endShift, saveSchedule, deleteSchedule, claimReward };
}


// Hooks for derived data
export const useActiveShift = (cashierId?: string) => {
    const { shifts } = useData();
    return useMemo(() => {
        if (!cashierId) return null;
        return shifts.find(s => s.cashierId === cashierId && !s.endTime) || null;
    }, [shifts, cashierId]);
};

export const useShiftSummary = (shift: Shift | null) => {
    const { orders } = useData();
    return useMemo(() => {
        if (!shift) return null;
        const shiftOrders = orders.filter(o => {
            const orderTime = new Date(o.createdAt).getTime();
            const startTime = new Date(shift.startTime).getTime();
            const endTime = shift.endTime ? new Date(shift.endTime).getTime() : Date.now();
            return orderTime >= startTime && orderTime <= endTime;
        });

        const cashPayments = shiftOrders.filter(o => o.paymentMethod === 'Cash' && o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0);
        const cardPayments = shiftOrders.filter(o => o.paymentMethod === 'Online' && o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0); // Assuming Card is Online
        const mobilePayments = 0; // Not tracked separately in this mock
        const tips = 0; // Not tracked in this mock

        const expectedInDrawer = shift.startFloat + cashPayments;

        return {
            cashPayments,
            cardPayments,
            mobilePayments,
            tips,
            expectedInDrawer,
        };
    }, [shift, orders]);
};