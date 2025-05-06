
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete
}) => {
  return (
    <Card className={`overflow-hidden ${!service.is_available ? 'opacity-70' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{service.name}</h3>
          {!service.is_available && (
            <Badge variant="outline" className="bg-gray-100 text-gray-500">
              Not Available
            </Badge>
          )}
        </div>
        
        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {service.duration} min
              {(service.preparation_time || service.cleanup_time) ? 
                ` (+ ${service.preparation_time || 0} prep, ${service.cleanup_time || 0} cleanup)` : 
                ''}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {service.location_type === 'in-person' ? 'In Person' : 
               service.location_type === 'remote' ? 'Remote/Virtual' : 
               'In Person or Remote'}
            </span>
          </div>
          
          {service.category && (
            <Badge variant="secondary" className="mt-2">
              {service.category}
            </Badge>
          )}
          
          <div className="mt-3 font-semibold text-lg">
            {formatCurrency(service.price, service.currency)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-3 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(service)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(service.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
