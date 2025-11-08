

import React, { useMemo } from 'react';
import { Order } from '../types';
import { CloseIcon, NavigationIcon } from './Icons';
import GoogleMapsEmbed from './GoogleMapsEmbed';
import { useData } from '../context/DataContext';

interface OrderTrackingModalProps {
  order: Order;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
    const { users: allUsers } = useData();

    const deliveryPartner = useMemo(() => {
        return allUsers.find(u => u.id === order.deliveryPartnerId);
    }, [allUsers, order.deliveryPartnerId]);
  
    return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Live Tracking for Order #{order.id.slice(-4)}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96">
                {order.address ? (
                    <GoogleMapsEmbed destinationAddress={order.address} />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">No address provided for this order.</p>
                    </div>
                )}
            </div>
            <div className="md:col-span-1">
                <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Delivery Details</h4>
                {deliveryPartner && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                        <img src={deliveryPartner.avatarUrl} alt={deliveryPartner.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{deliveryPartner.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Partner</p>
                        </div>
                    </div>
                )}
                 <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                        <NavigationIcon className="w-5 h-5 mr-3 mt-0.5 text-amber-500" />
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-200">Destination</p>
                            <p className="text-gray-600 dark:text-gray-300">{order.customerName}</p>
                            <p className="text-gray-500 dark:text-gray-400">{order.address}</p>
                            <p className="text-gray-500 dark:text-gray-400">{order.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                         <div className="w-5 h-5 mr-3 mt-0.5 text-amber-500 font-bold text-center">!</div>
                         <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-200">Status</p>
                            <p className="text-gray-600 dark:text-gray-300">{order.status}</p>
                         </div>
                    </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingModal;