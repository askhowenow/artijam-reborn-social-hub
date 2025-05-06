
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarPlus, Filter } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import ServiceCard from '@/components/services/ServiceCard';
import VendorServices from '@/features/vendor/VendorServices';

interface ServicesPageProps {
  vendor?: boolean;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ vendor = false }) => {
  const navigate = useNavigate();
  const { services, isLoading } = useServices();
  const { vendorProfile, isLoading: isLoadingVendor } = useVendorProfile();

  if (vendor) {
    return <VendorServices />;
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Services</h1>
          <p className="text-gray-500">Browse and book services from our community</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          
          {vendorProfile && (
            <Button 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
              onClick={() => navigate('/vendor/services')}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Manage Your Services
            </Button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              No services available at the moment.
            </p>
            {vendorProfile && (
              <Button 
                className="bg-artijam-purple hover:bg-artijam-purple/90"
                onClick={() => navigate('/vendor/services')}
              >
                Add Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.vendor_id}</p>
                </div>
                
                {service.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="font-semibold">
                    ${service.price.toFixed(2)} {service.currency}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-artijam-purple hover:bg-artijam-purple/90"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
