
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Location } from '@/types/event';

interface EventLocationMapProps {
  location: Location;
  onGetDirections?: () => void;
}

const EventLocationMap: React.FC<EventLocationMapProps> = ({ location, onGetDirections }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This would be replaced with real map integration
    // For now, we'll just show a placeholder
    if (mapContainerRef.current) {
      const mapPlaceholder = document.createElement('div');
      mapPlaceholder.className = 'bg-gray-100 w-full h-full flex items-center justify-center';
      mapPlaceholder.innerHTML = `
        <div class="text-center">
          <div class="mb-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13V21M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 10.1046 13.1046 11 12 11Z" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="text-gray-500">${location.address}, ${location.city}, ${location.state}, ${location.country}</p>
        </div>
      `;
      
      mapContainerRef.current.appendChild(mapPlaceholder);
      
      // In a real implementation, we would initialize the map here
      console.log('Map would be initialized with location:', location);
    }
    
    return () => {
      // Cleanup function would remove the map instance
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
    };
  }, [location]);
  
  const handleGetDirections = () => {
    if (onGetDirections) {
      onGetDirections();
    } else {
      // Open Google Maps directions in a new tab
      const address = `${location.address}, ${location.city}, ${location.state}, ${location.country}, ${location.postalCode}`;
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };
  
  const handleViewLargerMap = () => {
    const address = `${location.address}, ${location.city}, ${location.state}, ${location.country}, ${location.postalCode}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Event Location
        </CardTitle>
        <CardDescription>
          {location.address}, {location.city}, {location.state}, {location.country}, {location.postalCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 w-full bg-gray-100" ref={mapContainerRef}></div>
        <div className="p-4 flex justify-between">
          <Button variant="outline" onClick={handleGetDirections}>
            <Navigation className="mr-2 h-4 w-4" />
            Get Directions
          </Button>
          <Button variant="ghost" onClick={handleViewLargerMap}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Larger Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventLocationMap;
