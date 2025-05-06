
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import { formatCurrency } from '@/utils/string-utils';

interface VendorServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onManageAvailability: () => void;
  isSelected: boolean;
  isDeletingService?: boolean;
}

const VendorServiceCard: React.FC<VendorServiceCardProps> = ({ 
  service, 
  onEdit, 
  onDelete, 
  onManageAvailability,
  isSelected,
  isDeletingService = false
}) => {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-artijam-purple' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <span className="font-medium">{formatCurrency(service.price, service.currency || 'USD')}</span>
              <span className="mx-2">•</span>
              <span>{service.duration} min</span>
            </div>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
          )}
          
          <div className="pt-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onEdit}
              disabled={isDeletingService}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <Button 
              variant={isSelected ? "default" : "outline"}
              size="sm" 
              className={`flex-1 ${isSelected ? 'bg-artijam-purple hover:bg-artijam-purple/90' : ''}`}
              onClick={onManageAvailability}
              disabled={isDeletingService}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {isSelected ? 'Managing' : 'Availability'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
              disabled={isDeletingService}
            >
              {isDeletingService ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorServiceCard;
