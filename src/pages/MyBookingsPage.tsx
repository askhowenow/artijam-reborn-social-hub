
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useVendorBookings, VendorBooking } from '@/hooks/use-vendor-bookings';
import { useCustomerBookings, Booking } from '@/hooks/use-customer-bookings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MyBookingsPageProps {
  vendor?: boolean;
}

type CombinedBookingType = VendorBooking | Booking;

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ vendor = false }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  
  const vendorBookingsQuery = useVendorBookings();
  const customerBookingsQuery = useCustomerBookings();
  
  const bookingsQuery = vendor ? vendorBookingsQuery : customerBookingsQuery;
  const { data: bookings, isLoading, error } = bookingsQuery;
  
  // Create a mutation for updating booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({
      bookingId,
      newStatus,
    }: {
      bookingId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      return { bookingId, newStatus };
    },
    onSuccess: () => {
      toast.success('Booking status updated');
      queryClient.invalidateQueries({ queryKey: vendor ? ['vendor-bookings'] : ['customer-bookings'] });
    },
    onError: (error) => {
      console.error('Failed to update booking status:', error);
      toast.error('Failed to update booking status');
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          {vendor ? 'Vendor Bookings' : 'My Bookings'}
        </h1>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          {vendor ? 'Vendor Bookings' : 'My Bookings'}
        </h1>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-700">Error loading bookings. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          {vendor ? 'Vendor Bookings' : 'My Bookings'}
        </h1>
        <Card className="bg-gray-50 dark:bg-gray-800 border border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No bookings found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              {vendor 
                ? "When customers book your services, they'll appear here."
                : "When you book services, they'll appear here."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to safely access booking properties
  const getBookingName = (booking: CombinedBookingType, isVendor: boolean) => {
    if (isVendor) {
      // Return customer name for vendor view
      return (booking as VendorBooking).customer_name || 'Unknown Customer';
    } else {
      // Return vendor name for customer view
      return (booking as Booking).vendor_name || 'Unknown Vendor';
    }
  };

  // Helper function to get price based on booking type
  const getBookingPrice = (booking: CombinedBookingType, isVendor: boolean) => {
    if (isVendor) {
      return (booking as VendorBooking).total_price;
    } else {
      return (booking as Booking).price;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        {vendor ? 'Vendor Bookings' : 'My Bookings'}
      </h1>
      
      <Tabs defaultValue="upcoming" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4">
        {bookings.filter(booking => {
          const bookingDate = new Date(booking.start_time);
          const now = new Date();
          
          if (activeTab === 'upcoming') {
            return bookingDate > now && booking.status !== 'cancelled';
          } else if (activeTab === 'past') {
            return bookingDate < now && booking.status !== 'cancelled';
          } else {
            return booking.status === 'cancelled';
          }
        }).map(booking => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-lg">{booking.service_name}</h3>
                  {vendor ? (
                    <p className="text-gray-500">Customer: {getBookingName(booking, true)}</p>
                  ) : (
                    <p className="text-gray-500">Provider: {getBookingName(booking, false)}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`
                }>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Date: </span> 
                  {new Date(booking.start_time).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time: </span>
                  {new Date(booking.start_time).toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })} - 
                  {new Date(booking.end_time).toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
                {booking.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Notes: </span> 
                    {booking.notes}
                  </p>
                )}
                <p className="text-sm font-medium">${getBookingPrice(booking, vendor)}</p>
              </div>
              
              {/* Action buttons */}
              {vendor && booking.status === 'pending' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'confirmed' })}
                    disabled={updateBookingStatus.isPending}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'cancelled' })}
                    disabled={updateBookingStatus.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}
              
              {vendor && booking.status === 'confirmed' && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'completed' })}
                    disabled={updateBookingStatus.isPending}
                  >
                    Mark Complete
                  </Button>
                </div>
              )}
              
              {!vendor && booking.status === 'confirmed' && new Date(booking.start_time) > new Date() && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'cancelled' })}
                    disabled={updateBookingStatus.isPending}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBookingsPage;
