
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useServices, ServiceFormData } from '@/hooks/use-services';
import { useServiceAvailability } from '@/hooks/use-service-availability';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import DeleteProductDialog from '@/components/vendor/DeleteProductDialog';
import ServicesList from '@/components/services/ServicesList';
import ServiceFormDialog from '@/components/services/ServiceFormDialog';
import ServiceAvailabilitySection from '@/components/services/ServiceAvailabilitySection';

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

        <TabsContent value="services">
          <ServicesList 
            services={services || []}
            isLoading={isLoading}
            selectedServiceId={selectedServiceId}
            onAddService={() => handleOpenForm()}
            onEditService={handleOpenForm}
            onDeleteService={handleDeleteService}
            onManageAvailability={setSelectedServiceId}
            isDeletingService={deleteService.isPending}
          />
        </TabsContent>

        <TabsContent value="availability">
          <ServiceAvailabilitySection 
            selectedServiceId={selectedServiceId}
            services={services || []}
            availabilities={availabilities || []}
            isLoading={isLoadingAvailability}
            onBack={() => setSelectedServiceId(null)}
            onAddAvailability={createAvailability.mutateAsync}
            onDeleteAvailability={deleteAvailability.mutateAsync}
          />
        </TabsContent>
      </Tabs>

      {/* Service Form Dialog */}
      <ServiceFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        service={currentService}
        onSubmit={handleSubmitForm}
        isSubmitting={createService.isPending || updateService.isPending}
      />

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
