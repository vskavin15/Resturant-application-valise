
import { Notification } from '../types';

type Listener = (notification: Notification) => void;

class NotificationService {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(notificationData: Omit<Notification, 'id'>) {
    const notification: Notification = {
      id: Date.now(),
      ...notificationData,
    };
    this.listeners.forEach(listener => listener(notification));
  }
}

export const notificationService = new NotificationService();
