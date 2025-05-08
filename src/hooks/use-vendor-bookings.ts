import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus } from '@/types/booking';

// Use type aliases to avoid deep recursion in type instantiation
interface ServiceInfo {
  id: string;
  name: string;
  vendorId: string;
}

interface CustomerInfo {
  id: string;
  fullName: string | null;
}

// Simple lookup types to avoid deep recursion in type instantiation
type ServiceLookup = Record<string, ServiceInfo>;
type CustomerLookup = Record<string, CustomerInfo>;

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
      
      // First get service IDs that belong to this vendor
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('vendor_id', vendorProfile.id);
        
      if (servicesError) {
        throw servicesError;
      }
      
      if (!servicesData || servicesData.length === 0) {
        return [];
      }
      
      // Extract service IDs
      const serviceIds = servicesData.map(service => service.id);
      
      // Get bookings for these services
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          id, 
          service_id, 
          customer_id,
          status, 
          start_time,
          end_time,
          customer_notes,
          special_requests,
          booking_reference,
          created_at
        `)
        .in('service_id', serviceIds)
        .eq('status', 'confirmed')
        .order('start_time', { ascending: false });
        
      if (bookingsError) {
        throw bookingsError;
      }

      // If there are no bookings, return empty array
      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Extract IDs for separate queries
      const bookingServiceIds = [...new Set(bookingsData.map(booking => booking.service_id))];
      const customerIds = [...new Set(bookingsData.map(booking => booking.customer_id))];
      
      // Fetch services details
      const { data: servicesDetailsData, error: servicesDetailsError } = await supabase
        .from('services')
        .select('id, name, vendor_id')
        .in('id', bookingServiceIds);
        
      if (servicesDetailsError) {
        throw servicesDetailsError;
      }

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', customerIds);
        
      if (customersError) {
        throw customersError;
      }
      
      // Create lookup maps for services and customers
      const servicesMap: ServiceLookup = {};
      (servicesDetailsData || []).forEach(service => {
        servicesMap[service.id] = {
          id: service.id,
          name: service.name,
          vendorId: service.vendor_id
        };
      });
      
      const customersMap: CustomerLookup = {};
      (customersData || []).forEach(customer => {
        customersMap[customer.id] = {
          id: customer.id,
          fullName: customer.full_name
        };
      });
      
      // Transform to our Booking type
      return bookingsData.map(booking => {
        return {
          id: booking.id,
          serviceId: booking.service_id,
          customerId: booking.customer_id,
          status: booking.status as BookingStatus,
          startTime: booking.start_time,
          endTime: booking.end_time,
          bookingReference: booking.booking_reference,
          specialRequests: booking.special_requests,
          createdAt: booking.created_at,
          paymentStatus: 'pending', // We don't have this in the query, defaulting
          service: servicesMap[booking.service_id] || null,
          customer: customersMap[booking.customer_id] || null
        } as Booking;
      });
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
