
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ServiceForm from '@/components/services/ServiceForm';
import { Service, ServiceFormData } from '@/hooks/use-services';

interface ServiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSubmit: (formData: ServiceFormData & { id?: string }) => Promise<void>;
  isSubmitting: boolean;
}

const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  isOpen,
  onOpenChange,
  service,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {service 
              ? 'Update your service details below.'
              : 'Fill in the details to create a new service.'}
          </DialogDescription>
        </DialogHeader>

        <ServiceForm
          initialData={service}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;
