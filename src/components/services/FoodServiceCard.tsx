
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, CalendarCheck, Clock, Star, Users } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface FoodServiceCardProps {
  service: Service;
  onClick: () => void;
}

const FoodServiceCard: React.FC<FoodServiceCardProps> = ({ service, onClick }) => {
  // Mock data for demonstration
  const rating = 4.7;
  const cuisine = "Italian";
  const maxPartySize = 8;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center">
        <Utensils className="h-12 w-12 text-white" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{service.name}</h3>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs mr-2">
                  {cuisine}
                </Badge>
                <div className="flex items-center text-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{rating}</span>
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {service.category || 'Food'}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{service.duration} min dining experience</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>Up to {maxPartySize} guests</span>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <div className="font-semibold text-lg">
                {formatCurrency(service.price, service.currency || 'USD')}
              </div>
              <div className="text-xs text-gray-500">average per person</div>
            </div>
            
            <Button 
              size="sm" 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <CalendarCheck className="mr-1 h-4 w-4" />
              Reserve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodServiceCard;
