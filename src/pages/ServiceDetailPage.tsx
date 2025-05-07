import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useService } from '@/hooks/use-service';
import { useCreateBooking } from '@/hooks/use-create-booking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, MapPin, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import BookingFormSelector from '@/components/services/booking/BookingFormSelector';
import { formatCurrency } from '@/utils/string-utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { service, isLoading } = useService(id);
  const createBooking = useCreateBooking();
  const [isBookingMode, setIsBookingMode] = useState(false);
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading service details...</p>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
            <p className="text-gray-500 mb-6">The service you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/services')}>Browse Other Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleBookingSubmit = async (values: any) => {
    if (!service) return;
    
    try {
      // Transform form values based on service category to fit our booking model
      let startTime, endTime;
      
      // Handle different form structures based on category
      if (service.category?.toLowerCase().includes('accommodation')) {
        // For accommodation - use check-in and check-out dates
        startTime = new Date(values.checkInDate);
        startTime.setHours(15, 0, 0, 0); // Default check-in time 3 PM
        endTime = new Date(values.checkOutDate);
        endTime.setHours(11, 0, 0, 0); // Default check-out time 11 AM
      } else if (service.category?.toLowerCase().includes('food')) {
        // For food - use reservation date and time
        const [hours, minutes] = values.reservationTime.split(':').map(Number);
        startTime = new Date(values.reservationDate);
        startTime.setHours(hours, minutes, 0, 0);
        // Typical restaurant reservation is 2 hours
        endTime = new Date(startTime);
        endTime.setTime(endTime.getTime() + (2 * 60 * 60 * 1000));
      } else if (service.category?.toLowerCase().includes('attraction')) {
        // For attractions - use visit date and time
        const [hours, minutes] = values.visitTime.split(':').map(Number);
        startTime = new Date(values.visitDate);
        startTime.setHours(hours, minutes, 0, 0);
        // Default attraction visit time is the service duration or 2 hours
        const durationMs = (service.duration || 120) * 60 * 1000;
        endTime = new Date(startTime);
        endTime.setTime(endTime.getTime() + durationMs);
      } else {
        // Default case for travel and other services
        startTime = new Date();
        startTime.setHours(startTime.getHours() + 24); // Default to tomorrow
        startTime.setMinutes(0, 0, 0);
        endTime = new Date(startTime);
        endTime.setTime(endTime.getTime() + (service.duration || 60) * 60 * 1000);
      }
      
      await createBooking.mutateAsync({
        serviceId: service.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        additionalData: values,
      });
      
      // Show success message
      toast.success('Booking created successfully!');
      
      // Navigate to bookings page
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Button 
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => {
          if (isBookingMode) {
            setIsBookingMode(false);
          } else {
            navigate('/services');
          }
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isBookingMode ? 'Back to Service Details' : 'Back to Services'}
      </Button>
      
      {isBookingMode ? (
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Book {service?.name}</h1>
            {service && (
              <BookingFormSelector 
                service={service}
                onSubmit={handleBookingSubmit}
                isSubmitting={createBooking.isPending}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{service?.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{service?.duration} minutes</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {service?.location_type === 'virtual' 
                      ? 'Virtual Service' 
                      : service?.location_type === 'both'
                        ? 'In Person & Virtual'
                        : 'In Person'
                    }
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{formatCurrency(service?.price || 0, service?.currency || 'USD')}</span>
                </div>
              </div>
              
              <Tabs defaultValue="description">
                <TabsList className="mb-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="text-gray-700">
                  <p>{service?.description || 'No description available.'}</p>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Category</h3>
                      <p className="text-gray-600">{service?.category || 'Uncategorized'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-gray-600">
                        {service?.vendor?.location || 'Location information not available'}
                      </p>
                    </div>
                    
                    {service?.created_at && (
                      <div>
                        <h3 className="font-medium">Listed since</h3>
                        <p className="text-gray-600">{format(new Date(service.created_at), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Ready to book?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Secure your booking now for {service?.name}
                  </p>
                  <Button 
                    className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
                    onClick={() => setIsBookingMode(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div>
            <h2 className="text-xl font-bold mb-4">About the vendor</h2>
            {service?.vendor ? (
              <div className="flex items-center gap-4">
                {service.vendor.logo_url ? (
                  <img 
                    src={service.vendor.logo_url} 
                    alt={service.vendor.business_name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {service.vendor.business_name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{service.vendor.business_name}</h3>
                  <p className="text-sm text-gray-600">{service.vendor.description || 'No vendor description available.'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Vendor information not available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceDetailPage;
