

import React from 'react';
// FIX: Corrected import paths.
import { Location, User, Role } from '../types';
import { RESTAURANT_LOCATION } from '../constants';
import { MapPinIcon } from './Icons';
import { useData } from '../context/DataContext';

// Map simulation boundaries
const MAP_BOUNDS = {
  minLat: 34.03,
  maxLat: 34.08,
  minLng: -118.28,
  maxLng: -118.21,
};

const normalizeCoords = (location: Location): { x: number; y: number } => {
  const y = 100 - ((location.lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  const x = ((location.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
};

const LiveTrackingMap: React.FC = () => {
  const { users } = useData();

  const onlinePartners = users.filter(u => u.role === Role.DELIVERY_PARTNER && u.status === 'Online');
  const restaurantPos = normalizeCoords(RESTAURANT_LOCATION);

  return (
    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden border border-gray-300 dark:border-gray-600">
      {/* Restaurant Pin */}
      <div style={{ left: `${restaurantPos.x}%`, top: `${restaurantPos.y}%` }} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col items-center">
            <MapPinIcon className="w-8 h-8 text-red-500 drop-shadow-lg" />
            <span className="text-xs font-semibold bg-gray-800 text-white px-2 py-1 rounded-md -mt-2 shadow-lg">Restaurant</span>
        </div>
      </div>

      {/* Partner Pins */}
      {onlinePartners.map(partner => {
        if (!partner.location) return null;
        const pos = normalizeCoords(partner.location);
        return (
          <div
            key={partner.id}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear group"
          >
            <img 
                src={partner.avatarUrl} 
                alt={partner.name} 
                className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-lg"
            />
            <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-1/2 left-1/2">
                {partner.name}
                <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        );
      })}
       {onlinePartners.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No delivery partners are currently online.</p>
         </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;