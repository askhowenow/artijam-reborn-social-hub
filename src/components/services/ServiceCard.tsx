
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, CalendarCheck } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-2">{service.name}</h3>
            
            {service.category && (
              <Badge variant="outline" className="text-xs">
                {service.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.duration} minutes</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{service.location_type === 'virtual' 
              ? 'Virtual Service' 
              : service.location_type === 'both'
                ? 'In Person & Virtual'
                : 'In Person'
            }</span>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="font-semibold text-lg">
              {formatCurrency(service.price, service.currency || 'USD')}
            </div>
            <Button 
              size="sm" 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <CalendarCheck className="mr-1 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
