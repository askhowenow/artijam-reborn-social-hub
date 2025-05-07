
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, Clock, MapPin } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface TravelServiceCardProps {
  service: Service;
  onClick: () => void;
}

const TravelServiceCard: React.FC<TravelServiceCardProps> = ({ service, onClick }) => {
  // Mock data for demonstration
  const origin = "New York";
  const destination = "Los Angeles";
  const travelDate = "Jun 15";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-gradient-to-r from-sky-400 to-indigo-500 flex items-center justify-center">
        <Plane className="h-12 w-12 text-white" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{service.name}</h3>
            
            <Badge variant="outline" className="text-xs">
              {service.category || 'Travel'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{origin}</div>
            <div className="border-t-2 flex-1 mx-2 border-dashed"></div>
            <div className="text-sm font-medium">{destination}</div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{travelDate}</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{service.duration} min</span>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="font-semibold text-lg">
              {formatCurrency(service.price, service.currency || 'USD')}
              <span className="text-xs font-normal text-gray-500 ml-1">per person</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelServiceCard;
