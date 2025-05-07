
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
      
      // First get all booking IDs that belong to this vendor
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          id, 
          service_id, 
          customer_id,
          status, 
          start_time,
          end_time,
          additional_data,
          created_at
        `)
        .eq('service.vendor_id', vendorProfile.id)
        .order('start_time', { ascending: false });
        
      if (bookingsError) {
        throw bookingsError;
      }

      // If there are no bookings, return empty array
      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Extract IDs for separate queries
      const serviceIds = Array.from(new Set(bookingsData.map(booking => booking.service_id)));
      const customerIds = Array.from(new Set(bookingsData.map(booking => booking.customer_id)));
      
      // Fetch services and customers separately
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
      }, {} as Record<string, any>);
      
      const customersMap = (customerResponse.data || []).reduce((map, customer) => {
        map[customer.id] = customer;
        return map;
      }, {} as Record<string, any>);
      
      // Merge the data
      const apiBookings = bookingsData.map(booking => ({
        ...booking,
        service: servicesMap[booking.service_id] || null,
        customer: customersMap[booking.customer_id] || null
      }));
      
      // Transform to our Booking type
      return apiBookings.map(item => transformBookingFromApi(item as ApiBooking));
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
