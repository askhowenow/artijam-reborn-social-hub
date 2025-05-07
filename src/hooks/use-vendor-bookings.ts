
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus, ApiBooking } from '@/types/booking';
import { transformBookingFromApi } from '@/utils/data-transformers';

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
      
      // Use explicit type annotation to avoid excessive type instantiation
      type BookingResult = {
        id: string;
        service_id: string;
        customer_id: string;
        start_time: string;
        end_time: string;
        status: string;
        special_requests?: string;
        customer_notes?: string;
        payment_status?: string;
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
      };
      
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
        for (const item of data as BookingResult[]) {
          try {
            // Safe type checking of customer object
            const customerData = item.customer;
            // Fix for TS18047: Ensure customerData is not null before accessing properties
            if (customerData !== null && 
                customerData !== undefined &&
                typeof customerData === 'object' && 
                'id' in customerData) {
              // Cast to any to avoid deep type instantiation issues
              const bookingData = item as any;
              const transformedBooking = transformBookingFromApi(bookingData);
              bookingList.push(transformedBooking);
            } else {
              console.error('Invalid customer data:', item.customer);
            }
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
