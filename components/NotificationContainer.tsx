
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
