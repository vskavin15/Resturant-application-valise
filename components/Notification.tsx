
import React, { useEffect, useState } from 'react';
import { Notification as NotificationType } from '../types';
import { CloseIcon, CheckIcon, XMarkIcon } from './Icons';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Animate in
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id]);
  
  const handleDismiss = () => {
      setVisible(false);
      setTimeout(() => onDismiss(notification.id), 300); // wait for animation out
  }

  const typeStyles = {
    success: { bg: 'bg-green-500', icon: <CheckIcon className="w-6 h-6 text-white"/> },
    error: { bg: 'bg-red-500', icon: <XMarkIcon className="w-6 h-6 text-white"/> },
    info: { bg: 'bg-blue-500', icon: <div className="font-bold text-white text-lg">i</div> },
    warning: { bg: 'bg-yellow-500', icon: <div className="font-bold text-white text-lg">!</div> },
  };

  return (
    <div className={`
        relative w-full max-w-sm p-4 text-white rounded-lg shadow-lg flex items-start space-x-4
        ${typeStyles[notification.type].bg}
        transition-all duration-300 transform
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex-shrink-0">{typeStyles[notification.type].icon}</div>
      <div className="flex-grow">
        <p className="font-bold">{notification.title}</p>
        <p className="text-sm">{notification.message}</p>
      </div>
      <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/20">
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;
