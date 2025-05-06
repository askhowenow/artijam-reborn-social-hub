
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ServiceForm from '@/components/services/ServiceForm';
import { Service, ServiceFormData } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
          <div className="flex items-center justify-between">
            <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
        
        <DialogFooter className="mt-6 flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;
