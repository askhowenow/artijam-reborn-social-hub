
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
      
      // Split this into two separate queries to avoid excessive type nesting
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select('*, service_id, customer_id')
        .eq('service.vendor_id', vendorProfile.id)
        .order('start_time', { ascending: false });
        
      if (bookingsError) {
        throw bookingsError;
      }

      // If there are no bookings, return empty array
      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Now fetch the related service and customer data separately
      const serviceIds = bookingsData.map(booking => booking.service_id);
      const customerIds = bookingsData.map(booking => booking.customer_id);
      
      const [serviceResponse, customerResponse] = await Promise.all([
        supabase
          .from('services')
          .select('id, name, vendor_id')
          .in('id', serviceIds),
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', customerIds)
      ]);
      
      if (serviceResponse.error) throw serviceResponse.error;
      if (customerResponse.error) throw customerResponse.error;
      
      // Create lookup maps for services and customers
      const servicesMap = (serviceResponse.data || []).reduce((map, service) => {
        map[service.id] = service;
        return map;
      }, {});
      
      const customersMap = (customerResponse.data || []).reduce((map, customer) => {
        map[customer.id] = customer;
        return map;
      }, {});
      
      // Construct the API booking objects
      const apiBookings = bookingsData.map(booking => ({
        ...booking,
        service: servicesMap[booking.service_id] || null,
        customer: customersMap[booking.customer_id] || null
      })) as unknown as ApiBooking[];
      
      // Map the response data to our Booking type using the shared transformer
      return apiBookings.map((item) => transformBookingFromApi(item));
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
