
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Service } from '@/hooks/use-services';
import VendorServiceCard from '@/components/services/VendorServiceCard';

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  selectedServiceId: string | null;
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onManageAvailability: (serviceId: string) => void;
  isDeletingService?: boolean;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  isLoading,
  selectedServiceId,
  onAddService,
  onEditService,
  onDeleteService,
  onManageAvailability,
  isDeletingService = false
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first service to make it available for booking.
          </p>
          <Button 
            onClick={onAddService} 
            className="bg-artijam-purple hover:bg-artijam-purple/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <VendorServiceCard 
          key={service.id}
          service={service}
          onEdit={() => onEditService(service)}
          onDelete={() => onDeleteService(service.id)}
          onManageAvailability={() => onManageAvailability(service.id)}
          isSelected={selectedServiceId === service.id}
          isDeletingService={isDeletingService && selectedServiceId === service.id}
        />
      ))}
    </div>
  );
};

export default ServicesList;
