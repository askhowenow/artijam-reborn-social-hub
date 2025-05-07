
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, ApiBooking, BookingStatus } from '@/types/booking';
import { transformBookingFromApi } from '@/utils/data-transformers';

export const useCustomerBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service:service_id(
            id,
            name,
            vendor_id
          )
        `)
        .eq('customer_id', user.user.id)
        .order('start_time', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Cast to ApiBooking[] while adding type check
      const apiBookings = (data || []) as unknown as ApiBooking[];
      
      // Map the response data to our Booking type
      return apiBookings.map((item) => transformBookingFromApi(item));
    }
  });
  
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
        
      if (error) {
        throw error;
      }
    },
    meta: {
      onSuccess: () => {
        toast.success('Booking cancelled successfully');
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to cancel booking: ${error.message}`);
      }
    }
  });

  return {
    bookings,
    isLoading,
    error,
    cancelBooking
  };
};
