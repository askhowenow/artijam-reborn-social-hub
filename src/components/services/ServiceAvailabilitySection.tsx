
import React from 'react';
import { Button } from '@/components/ui/button';
import { Service } from '@/hooks/use-services';
import AvailabilityManager from '@/components/services/AvailabilityManager';
import { ServiceAvailability } from '@/hooks/use-service-availability';

interface ServiceAvailabilitySectionProps {
  selectedServiceId: string | null;
  services: Service[];
  availabilities: ServiceAvailability[];
  isLoading: boolean;
  onBack: () => void;
  onAddAvailability: (data: any) => Promise<any>;
  onDeleteAvailability: (id: string) => Promise<any>;
}

const ServiceAvailabilitySection: React.FC<ServiceAvailabilitySectionProps> = ({
  selectedServiceId,
  services,
  availabilities,
  isLoading,
  onBack,
  onAddAvailability,
  onDeleteAvailability
}) => {
  const selectedService = services.find(s => s.id === selectedServiceId);
  
  if (!selectedServiceId || !selectedService) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Managing Availability for: {selectedService.name}
        </h3>
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back to Services
        </Button>
      </div>

      <AvailabilityManager 
        serviceId={selectedServiceId}
        availabilities={availabilities || []}
        onAdd={onAddAvailability}
        onDelete={onDeleteAvailability}
      />
    </>
  );
};

export default ServiceAvailabilitySection;
