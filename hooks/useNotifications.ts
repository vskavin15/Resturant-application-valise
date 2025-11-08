
import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(notification => {
      setNotifications(prev => [...prev, notification]);
    });
    return unsubscribe;
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, removeNotification };
};
