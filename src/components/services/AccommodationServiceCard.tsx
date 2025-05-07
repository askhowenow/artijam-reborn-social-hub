
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Calendar, MapPin, Star } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface AccommodationServiceCardProps {
  service: Service;
  onClick: () => void;
}

const AccommodationServiceCard: React.FC<AccommodationServiceCardProps> = ({ service, onClick }) => {
  // Mock data for demonstration (in a real implementation, these would be properties of the service)
  const rating = 4.8;
  const location = "City Center";
  const amenities = ["WiFi", "Parking", "Breakfast"];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-gray-200 relative">
        {/* This would be the accommodation image */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-white text-gray-800 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{service.name}</h3>
            
            <Badge variant="outline" className="text-xs">
              {service.category || 'Accommodations'}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
          )}
          
          <div className="flex flex-wrap gap-1">
            {amenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <div className="font-semibold text-lg">
                {formatCurrency(service.price, service.currency || 'USD')}
              </div>
              <div className="text-xs text-gray-500">per night</div>
            </div>
            
            <Button 
              size="sm" 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <Calendar className="mr-1 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationServiceCard;
