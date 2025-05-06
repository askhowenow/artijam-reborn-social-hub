
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Service } from '@/hooks/use-services';
import AvailabilityManager from '@/components/services/AvailabilityManager';
import { ServiceAvailability } from '@/hooks/use-service-availability';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';

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
  
  const sortedAvailabilities = [...availabilities].sort((a, b) => a.day_of_week - b.day_of_week);
  
  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-artijam-purple" />
          <h3 className="text-lg font-semibold">
            Managing Availability for: {selectedService.name}
          </h3>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
            </div>
          ) : (
            <AvailabilityManager 
              serviceId={selectedServiceId}
              availabilities={sortedAvailabilities || []}
              onAdd={onAddAvailability}
              onDelete={onDeleteAvailability}
            />
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scheduling Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Service Duration</p>
              <p>{selectedService.duration} minutes</p>
            </div>
            <div>
              <p className="font-medium">Preparation Time</p>
              <p>{selectedService.preparation_time || 0} minutes</p>
            </div>
            <div>
              <p className="font-medium">Cleanup Time</p>
              <p>{selectedService.cleanup_time || 0} minutes</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Total slot time: {selectedService.duration + (selectedService.preparation_time || 0) + (selectedService.cleanup_time || 0)} minutes</p>
            <p className="mt-2">
              Remember to include preparation and cleanup time in your availability windows.
              Customers will only see the service duration in their bookings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceAvailabilitySection;
