
import React from 'react';
import { useVendorBookings } from '@/hooks/use-vendor-bookings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VendorBookingsProps {
  status?: string;
}

const VendorBookings: React.FC<VendorBookingsProps> = ({ status }) => {
  const queryClient = useQueryClient();
  const vendorBookingsQuery = useVendorBookings({ 
    status: status as any
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({
      bookingId,
      newStatus,
    }: {
      bookingId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      return { bookingId, newStatus };
    },
    onSuccess: () => {
      toast.success('Booking status updated');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
    },
    onError: () => {
      toast.error('Failed to update booking status');
    },
  });

  return (
    <div>
      {/* Pass the component props correctly */}
      {vendorBookingsQuery.data?.map(booking => (
        <div key={booking.id} className="mb-4 p-4 border rounded-md">
          <h3>{booking.service_name}</h3>
          <p>Customer: {booking.customer_name}</p>
          <p>Date: {new Date(booking.start_time).toLocaleDateString()}</p>
          <p>Status: {booking.status}</p>
          {booking.status === 'pending' && (
            <div className="mt-2 space-x-2">
              <button 
                onClick={() => 
                  updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'confirmed' })
                }
                className="px-2 py-1 bg-green-500 text-white rounded"
              >
                Confirm
              </button>
              <button 
                onClick={() => 
                  updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'cancelled' })
                }
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
      {vendorBookingsQuery.isLoading && <p>Loading bookings...</p>}
      {vendorBookingsQuery.data?.length === 0 && <p>No bookings found.</p>}
    </div>
  );
};

export default VendorBookings;
