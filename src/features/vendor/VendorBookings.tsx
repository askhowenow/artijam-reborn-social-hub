
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
      // Use RPC function instead of direct table update
      const { error } = await supabase
        .rpc('update_booking_status', {
          booking_id_param: bookingId,
          new_status_param: newStatus
        });

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
    <div className="space-y-4">
      {vendorBookingsQuery.isLoading && (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p>Loading bookings...</p>
        </div>
      )}
      
      {vendorBookingsQuery.data?.length === 0 && (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p>No bookings found.</p>
        </div>
      )}
      
      {vendorBookingsQuery.data?.map(booking => (
        <div key={booking.id} className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white">{booking.service_name}</h3>
          <p className="text-gray-700 dark:text-gray-300">Customer: {booking.customer_name}</p>
          <p className="text-gray-700 dark:text-gray-300">Date: {new Date(booking.start_time).toLocaleDateString()}</p>
          <div className="flex items-center mt-2">
            <span className="text-gray-700 dark:text-gray-300 mr-2">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
              booking.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            }`}>
              {booking.status}
            </span>
          </div>
          
          {booking.status === 'pending' && (
            <div className="mt-3 space-x-2 flex">
              <button 
                onClick={() => 
                  updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'confirmed' })
                }
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium dark:bg-green-600 dark:hover:bg-green-700"
              >
                Confirm
              </button>
              <button 
                onClick={() => 
                  updateBookingStatus.mutate({ bookingId: booking.id, newStatus: 'cancelled' })
                }
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium dark:bg-red-600 dark:hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VendorBookings;
