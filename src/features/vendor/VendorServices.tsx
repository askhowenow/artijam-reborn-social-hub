
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, PlusCircle } from 'lucide-react';
import ServiceForm from '@/components/services/ServiceForm';
import AvailabilityManager from '@/components/services/AvailabilityManager';
import { useServices, ServiceFormData } from '@/hooks/use-services';
import { useServiceAvailability } from '@/hooks/use-service-availability';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import DeleteProductDialog from '@/components/vendor/DeleteProductDialog';
import VendorServiceCard from '@/components/services/VendorServiceCard';

const VendorServices = () => {
  const { vendorProfile } = useVendorProfile();
  const { services, isLoading, createService, updateService, deleteService } = useServices(vendorProfile?.id);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const { availabilities, isLoading: isLoadingAvailability, createAvailability, deleteAvailability } = 
    useServiceAvailability(selectedServiceId || undefined);

  const handleOpenForm = (service?: any) => {
    setCurrentService(service || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentService(null);
  };

  const handleSubmitForm = async (formData: ServiceFormData & { id?: string }) => {
    try {
      if (formData.id) {
        await updateService.mutateAsync({
          ...formData,
          id: formData.id
        });
      } else {
        const newService = await createService.mutateAsync(formData);
        if (newService) {
          // Auto-select the newly created service for availability management
          setSelectedServiceId(newService.id);
        }
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setCurrentService({ id: serviceId });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (currentService?.id) {
      await deleteService.mutateAsync(currentService.id);
      setIsDeleteDialogOpen(false);
      setCurrentService(null);
      
      // If we deleted the currently selected service, clear the selection
      if (selectedServiceId === currentService.id) {
        setSelectedServiceId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Services Management</h2>
        <Button 
          onClick={() => handleOpenForm()} 
          className="bg-artijam-purple hover:bg-artijam-purple/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      {!services || services.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first service to make it available for booking.
            </p>
            <Button 
              onClick={() => handleOpenForm()} 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs 
          defaultValue="services" 
          value={selectedServiceId ? "availability" : "services"}
          onValueChange={(value) => {
            if (value === "services") setSelectedServiceId(null);
          }}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability" disabled={!selectedServiceId}>
              Manage Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <VendorServiceCard 
                  key={service.id}
                  service={service}
                  onEdit={() => handleOpenForm(service)}
                  onDelete={() => handleDeleteService(service.id)}
                  onManageAvailability={() => setSelectedServiceId(service.id)}
                  isSelected={selectedServiceId === service.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability">
            {selectedServiceId && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Managing Availability for: {services.find(s => s.id === selectedServiceId)?.name}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedServiceId(null)}
                  >
                    Back to Services
                  </Button>
                </div>

                <AvailabilityManager 
                  serviceId={selectedServiceId}
                  availabilities={availabilities || []}
                  onAdd={createAvailability.mutateAsync}
                  onDelete={deleteAvailability.mutateAsync}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Service Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {currentService 
                ? 'Update your service details below.'
                : 'Fill in the details to create a new service.'}
            </DialogDescription>
          </DialogHeader>

          <ServiceForm
            initialData={currentService}
            onSubmit={handleSubmitForm}
            isSubmitting={createService.isPending || updateService.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {currentService && (
        <DeleteProductDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteService}
          item={currentService}
          isDeleting={deleteService.isPending}
          type="service"
        />
      )}
    </div>
  );
};

export default VendorServices;
