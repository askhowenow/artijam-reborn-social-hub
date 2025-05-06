
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';

// Define a simplified interface for the API response structure
interface ServiceBookingResponse {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  special_requests?: string;
  customer_notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  service?: {
    id: string;
    name: string;
    vendor_id: string;
  };
  customer?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

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
      
      // Map the response data to our Booking type
      return (data || []).map((item: ServiceBookingResponse) => {
        return {
          id: item.id,
          service_id: item.service_id,
          customer_id: item.customer_id,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status,
          special_requests: item.special_requests,
          customer_notes: item.customer_notes,
          payment_status: item.payment_status,
          booking_reference: item.booking_reference,
          qr_code: item.qr_code,
          created_at: item.created_at,
          service: item.service,
          customer: item.customer
        } as Booking;
      });
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
