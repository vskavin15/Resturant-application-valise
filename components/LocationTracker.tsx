

import React, { useEffect, useRef, useMemo } from 'react';
// FIX: Corrected import paths.
import { useAuth, updateUserLocation } from '../auth';
import { Role, OrderStatus } from '../types';
import { useData } from '../context/DataContext';

const LocationTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const { orders: allOrders } = useData();
  const watchIdRef = useRef<number | null>(null);

  const hasActiveDelivery = useMemo(() => {
    if (!currentUser) return false;
    return allOrders.some(
      order =>
        order.deliveryPartnerId === currentUser.id &&
        order.status === OrderStatus.OUT_FOR_DELIVERY
    );
  }, [allOrders, currentUser]);


  useEffect(() => {
    const startWatching = () => {
      if (watchIdRef.current === null && navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (currentUser) {
              const { latitude, longitude } = position.coords;
              updateUserLocation(currentUser.id, { lat: latitude, lng: longitude });
            }
          },
          (error) => {
            console.error("Error watching location: ", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // 5 seconds
            maximumAge: 0,
          }
        );
      }
    };

    const stopWatching = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    // Condition to start high-frequency tracking: User is a delivery partner, is online, and has an active delivery.
    if (currentUser?.role === Role.DELIVERY_PARTNER && currentUser.status === 'Online' && hasActiveDelivery) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [currentUser, hasActiveDelivery]);

  return null; // This component does not render anything
};

export default LocationTracker;