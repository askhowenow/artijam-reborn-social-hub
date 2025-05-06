
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarPlus, Filter, Search } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import ServiceCard from '@/components/services/ServiceCard';
import VendorServices from '@/features/vendor/VendorServices';
import { Input } from '@/components/ui/input';

interface ServicesPageProps {
  vendor?: boolean;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ vendor = false }) => {
  const navigate = useNavigate();
  const { services, isLoading } = useServices();
  const { vendorProfile, isLoading: isLoadingVendor } = useVendorProfile();
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Services</h1>
          <p className="text-gray-500">Browse and book services from our community</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {vendorProfile && (
            <Button 
              className="bg-artijam-purple hover:bg-artijam-purple/90 whitespace-nowrap"
              onClick={() => navigate('/vendor/services')}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Manage Your Services
            </Button>
          )}
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No services found matching "${searchTerm}"`
                : "No services available at the moment."}
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
          {filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onClick={() => navigate(`/services/${service.id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
