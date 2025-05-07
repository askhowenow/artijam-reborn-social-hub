
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

// Define intermediate types for Supabase query results
interface CustomerResult {
  id: string;
  email: string;
  full_name?: string;
}

interface ServiceResult {
  id: string;
  name: string;
  vendor_id: string;
}

// Flattened API structure to avoid deep recursion
interface RawApiBooking {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  special_requests?: string;
  customer_notes?: string;
  payment_status: PaymentStatus;
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  service?: ServiceResult;
  customer?: CustomerResult;
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
      
      // Using a simpler query structure to avoid excessive type nesting
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
      
      // Process raw data with proper type handling
      const bookingList: Booking[] = [];
      
      if (data) {
        for (const item of data as unknown[]) {
          try {
            const rawBooking = item as RawApiBooking;
            const transformedBooking = {
              id: rawBooking.id,
              serviceId: rawBooking.service_id,
              customerId: rawBooking.customer_id,
              startTime: rawBooking.start_time,
              endTime: rawBooking.end_time,
              status: rawBooking.status,
              specialRequests: rawBooking.special_requests,
              customerNotes: rawBooking.customer_notes,
              paymentStatus: rawBooking.payment_status,
              bookingReference: rawBooking.booking_reference,
              qrCode: rawBooking.qr_code,
              createdAt: rawBooking.created_at,
              service: rawBooking.service ? {
                id: rawBooking.service.id,
                name: rawBooking.service.name,
                vendorId: rawBooking.service.vendor_id,
              } : undefined,
              customer: rawBooking.customer ? {
                id: rawBooking.customer.id,
                email: rawBooking.customer.email,
                fullName: rawBooking.customer.full_name,
              } : undefined
            };
            bookingList.push(transformedBooking);
          } catch (e) {
            console.error('Error processing booking:', e);
          }
        }
      }
      
      return bookingList;
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
