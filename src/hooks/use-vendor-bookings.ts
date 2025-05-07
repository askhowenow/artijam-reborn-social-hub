
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus } from '@/types/booking';

// Define simple interface for raw database results to avoid deep type nesting
interface RawBookingData {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  special_requests?: string;
  customer_notes?: string;
  payment_status: string;
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
      
      // Using a simpler approach to avoid excessive nesting
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          id,
          service_id,
          customer_id,
          start_time,
          end_time,
          status,
          special_requests,
          customer_notes,
          payment_status,
          booking_reference,
          qr_code,
          created_at,
          service:service_id (
            id,
            name,
            vendor_id
          ),
          customer:customer_id (
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
      
      // Transform data safely with explicit typing
      const transformedBookings: Booking[] = [];
      
      if (data) {
        // Cast data to the simpler interface to break circular reference
        const rawBookings = data as unknown as RawBookingData[];
        
        for (const rawBooking of rawBookings) {
          const booking: Booking = {
            id: rawBooking.id,
            serviceId: rawBooking.service_id,
            customerId: rawBooking.customer_id,
            startTime: rawBooking.start_time,
            endTime: rawBooking.end_time,
            status: rawBooking.status,
            specialRequests: rawBooking.special_requests,
            customerNotes: rawBooking.customer_notes,
            paymentStatus: rawBooking.payment_status as any,
            bookingReference: rawBooking.booking_reference,
            qrCode: rawBooking.qr_code,
            createdAt: rawBooking.created_at,
          };
          
          // Add service if available
          if (rawBooking.service) {
            booking.service = {
              id: rawBooking.service.id,
              name: rawBooking.service.name,
              vendorId: rawBooking.service.vendor_id,
            };
          }
          
          // Add customer if available
          if (rawBooking.customer) {
            booking.customer = {
              id: rawBooking.customer.id,
              email: rawBooking.customer.email,
              fullName: rawBooking.customer.full_name,
            };
          }
          
          transformedBookings.push(booking);
        }
      }
      
      return transformedBookings;
    }
  });
  
  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: BookingStatus }) => {
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
