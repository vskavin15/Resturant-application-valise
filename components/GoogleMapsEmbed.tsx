
import React from 'react';

interface GoogleMapsEmbedProps {
  destinationAddress: string;
}

const GoogleMapsEmbed: React.FC<GoogleMapsEmbedProps> = ({ destinationAddress }) => {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(destinationAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
      <iframe
        width="100%"
        height="100%"
        src={mapSrc}
        title={`Map of ${destinationAddress}`}
        aria-label={`Map showing location of ${destinationAddress}`}
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
      ></iframe>
    </div>
  );
};

export default GoogleMapsEmbed;
