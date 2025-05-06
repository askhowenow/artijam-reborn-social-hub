
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useCustomerBookings, useVendorBookings } from '@/hooks/use-service-bookings';

interface MyBookingsPageProps {
  vendor?: boolean;
}

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ vendor = false }) => {
  const navigate = useNavigate();
  const { bookings: customerBookings, isLoading: isLoadingCustomer, cancelBooking } = useCustomerBookings();
  const { bookings: vendorBookings, isLoading: isLoadingVendor, updateBookingStatus } = useVendorBookings();
  
  const bookings = vendor ? vendorBookings : customerBookings;
  const isLoading = vendor ? isLoadingVendor : isLoadingCustomer;
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  // Check if user is authenticated
  const { data: session, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    meta: {
      onSuccess: (session) => {
        if (!session) {
          toast.error('You must be logged in to view your bookings');
          navigate('/login');
        }
      }
    }
  });

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      if (vendor) {
        await updateBookingStatus.mutateAsync({
          bookingId: selectedBooking,
          status: 'cancelled'
        });
      } else {
        await cancelBooking.mutateAsync(selectedBooking);
      }
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading {vendor ? 'vendor' : ''} bookings...</p>
        </div>
      </div>
    );
  }

  // Filter bookings by status
  const activeBookings = bookings?.filter(booking => 
    booking.status !== 'cancelled' && booking.status !== 'completed'
  ) || [];
  
  const pastBookings = bookings?.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  ) || [];

  const getVendorBusinessName = (booking: any) => {
    if (vendor) {
      // When in vendor mode, show customer name instead
      return booking.customer?.email || 'Unknown Customer';
    }
    
    // Check service vendor structure safely
    return booking.service?.vendor_id || 'Unknown Vendor';
  };

  const pageTitle = vendor ? "Manage Bookings" : "My Bookings";
  const emptyMessage = vendor 
    ? "You don't have any bookings for your services yet" 
    : "You don't have any upcoming bookings";
  const browseText = vendor ? "Manage Services" : "Browse Services";
  const browseLink = vendor ? "/vendor/services" : "/services";

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {activeBookings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">{emptyMessage}</p>
              <Button 
                onClick={() => navigate(browseLink)} 
                className="bg-artijam-purple hover:bg-artijam-purple/90"
              >
                {browseText}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-artijam-purple" />
                          <h3 className="font-semibold">
                            {booking.service?.name}
                          </h3>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {getVendorBusinessName(booking)}
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {format(parseISO(booking.start_time), 'MMM d, yyyy h:mm a')} - 
                            {format(parseISO(booking.end_time), ' h:mm a')}
                          </span>
                        </div>
                        
                        {booking.special_requests && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {booking.special_requests}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <Badge 
                          className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {booking.status}
                        </Badge>
                        
                        <div className="mt-2 space-y-2">
                          {vendor && (
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => updateBookingStatus.mutate({
                                  bookingId: booking.id,
                                  status: 'confirmed'
                                })}
                                disabled={booking.status === 'confirmed'}
                              >
                                Confirm
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => updateBookingStatus.mutate({
                                  bookingId: booking.id,
                                  status: 'completed'
                                })}
                              >
                                Mark Complete
                              </Button>
                            </div>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map(booking => (
                <Card key={booking.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                          <h3 className="font-medium">
                            {booking.service?.name}
                          </h3>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {getVendorBusinessName(booking)}
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {format(parseISO(booking.start_time), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex items-center">
                        <Badge 
                          className={
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {cancelBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookingsPage;
