
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, Calendar, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { formatCurrency } from '@/utils/string-utils';
import BookingCalendar from '@/components/services/BookingCalendar';
import { useCustomerBookings, ServiceBookingFormData } from '@/hooks/use-service-bookings';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { createBooking } = useCustomerBookings();

  // Check if user is authenticated
  const { data: session, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch all services
  const { data: services, isLoading } = useQuery({
    queryKey: ['services-list', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          vendor:vendor_id(business_name, business_type, is_verified)
        `)
        .eq('is_available', true);
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services. Please try again later.');
      }
    }
  });

  // Fetch service availability when a service is selected
  const { data: serviceAvailability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['service-availability', selectedService?.id],
    queryFn: async () => {
      if (!selectedService) return [];
      
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', selectedService.id)
        .order('day_of_week', { ascending: true });
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!selectedService,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch service availability:', error);
        toast.error('Failed to load service availability. Please try again later.');
      }
    }
  });

  // Fetch existing bookings for the selected service
  const { data: existingBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['service-bookings', selectedService?.id],
    queryFn: async () => {
      if (!selectedService) return [];
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('service_id', selectedService.id)
        .not('status', 'eq', 'cancelled');
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!selectedService,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch existing bookings:', error);
        toast.error('Failed to load booking information. Please try again later.');
      }
    }
  });

  // Get unique categories from services
  const categories = React.useMemo(() => {
    if (!services) return [];
    
    const uniqueCategories = new Set<string>();
    services.forEach(service => {
      if (service.category) {
        uniqueCategories.add(service.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [services]);

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async (bookingData: ServiceBookingFormData) => {
    if (!session) {
      toast.error('You must be logged in to book a service');
      navigate('/login');
      return;
    }
    
    try {
      await createBooking.mutateAsync(bookingData);
      setBookingDialogOpen(false);
      setSelectedService(null);
      
      // Redirect to user's bookings
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const filteredServices = React.useMemo(() => {
    if (!services) return [];
    
    let filtered = [...services];
    
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        (service.name && service.name.toLowerCase().includes(searchLower)) || 
        (service.description && service.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [services, selectedCategory, searchTerm]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Book Services</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search services by name or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <Button 
              variant={!selectedCategory ? "default" : "outline"}
              className={`w-full ${!selectedCategory ? "bg-artijam-purple hover:bg-artijam-purple/90" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
          </div>
        </div>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={selectedCategory === category ? "bg-artijam-purple hover:bg-artijam-purple/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-xl mb-4">No services found</p>
            <p className="text-gray-500">
              {searchTerm || selectedCategory ? 
                "Try adjusting your search or category filter." : 
                "There are no services available at this time."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  {service.category && (
                    <Badge variant="secondary">
                      {service.category}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  by {service.vendor.business_name}
                  {service.vendor.is_verified && (
                    <span className="ml-1 text-blue-500">✓</span>
                  )}
                </div>
                
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{service.duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {service.location_type === 'in-person' ? 'In Person' : 
                       service.location_type === 'remote' ? 'Remote/Virtual' : 
                       'In Person or Remote'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    {formatCurrency(service.price, service.currency)}
                  </span>
                  
                  <Button
                    onClick={() => handleSelectService(service)}
                    className="bg-artijam-purple hover:bg-artijam-purple/90"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      {selectedService && (
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Book {selectedService.name}</DialogTitle>
            </DialogHeader>
            
            {isLoadingAvailability || isLoadingBookings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
              </div>
            ) : (
              <BookingCalendar 
                service={selectedService}
                availabilities={serviceAvailability || []}
                existingBookings={existingBookings || []}
                onBookingSubmit={handleBookingSubmit}
                isSubmitting={createBooking.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServicesPage;
