
import { Location } from './types';

// Haversine formula to calculate distance between two lat/lng points
const getDistanceInKm = (loc1: Location, loc2: Location) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Simple ETA calculation
export const getEta = (partnerLocation?: Location, customerLocation?: Location): number => {
    if (!partnerLocation || !customerLocation) {
        return 15; // Return a default ETA
    }
    const distance = getDistanceInKm(partnerLocation, customerLocation);
    // Assuming an average speed of 25 km/h in a city, and add 5 minutes for pickup/dropoff
    const timeInMinutes = (distance / 25) * 60 + 5;
    return Math.round(timeInMinutes);
};

// Function to simulate movement towards a destination
export const moveTowards = (start: Location, end: Location, fraction: number = 0.1): Location => {
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;
    
    return {
        lat: start.lat + dLat * fraction,
        lng: start.lng + dLng * fraction
    };
};
