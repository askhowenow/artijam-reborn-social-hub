
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Clock, Calendar, Star } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface AttractionServiceCardProps {
  service: Service;
  onClick: () => void;
}

const AttractionServiceCard: React.FC<AttractionServiceCardProps> = ({ service, onClick }) => {
  // Mock data for demonstration
  const rating = 4.6;
  const location = "Downtown";
  const features = ["Guided Tour", "Skip the Line"];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
        <Ticket className="h-12 w-12 text-white" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{service.name}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{rating}</span>
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {service.category || 'Attractions'}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{service.duration} min experience</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
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
              <Calendar className="mr-1 h-4 w-4" />
              Get Tickets
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttractionServiceCard;
