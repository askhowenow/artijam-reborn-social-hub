
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';

export const useVendorBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['vendor-bookings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      const { data: vendorProfile, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();
        
      if (vendorError) {
        throw vendorError;
      }
      
      if (!vendorProfile) {
        throw new Error('No vendor profile found');
      }
      
      // Use explicit type casting to address the complex type nesting issue
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service:service_id(
            id,
            name,
            vendor_id
          ),
          customer:customer_id(
            id,
            email,
            full_name
          )
        `)
        .eq('service.vendor_id', vendorProfile.id)
        .order('start_time', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Use type assertion with unknown as intermediary to safely convert the response
      return (data as unknown) as Booking[];
    }
  });
  
  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: Booking['status'] }) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status })
        .eq('id', bookingId);
        
      if (error) {
        throw error;
      }
    },
    meta: {
      onSuccess: (_, variables) => {
        toast.success(`Booking ${variables.status} successfully`);
        queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to update booking: ${error.message}`);
      }
    }
  });

  return {
    bookings,
    isLoading,
    error,
    updateBookingStatus
  };
};
