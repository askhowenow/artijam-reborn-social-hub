
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus } from '@/types/booking';
import { transformBookingFromApi } from '@/utils/data-transformers';

// Define a simplified interface for raw booking data from the database
interface RawBookingData {
  id: string;
  service_id: string;
  customer_id: string;
  status: BookingStatus;
  start_time: string;
  end_time: string;
  customer_notes?: string;
  special_requests?: string;
  created_at: string;
  booking_reference?: string;
}

// Define interfaces for service and customer data
interface RawServiceData {
  id: string;
  name: string;
  vendor_id: string;
}

interface RawCustomerData {
  id: string;
  full_name: string | null;
}

// Combined booking data with related entities
interface RawBookingWithRelations {
  bookingData: RawBookingData;
  service: RawServiceData | null;
  customer: RawCustomerData | null;
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
          customer_notes,
          special_requests,
          booking_reference,
          created_at
        `)
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
      const serviceIds = Array.from(new Set(bookingsData.map(booking => booking.service_id)));
      const customerIds = Array.from(new Set(bookingsData.map(booking => booking.customer_id)));
      
      // Fetch services that belong to this vendor
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, vendor_id')
        .eq('vendor_id', vendorProfile.id)
        .in('id', serviceIds);
        
      if (servicesError) {
        throw servicesError;
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
      const servicesMap: Record<string, RawServiceData> = {};
      (servicesData || []).forEach(service => {
        servicesMap[service.id] = service;
      });
      
      const customersMap: Record<string, RawCustomerData> = {};
      (customersData || []).forEach(customer => {
        customersMap[customer.id] = customer;
      });
      
      // Filter bookings to only include those for services owned by this vendor
      const vendorBookings = bookingsData.filter(booking => 
        servicesMap[booking.service_id]
      );
      
      // Create combined data structure
      const bookingsWithRelations: RawBookingWithRelations[] = vendorBookings.map(booking => ({
        bookingData: booking as RawBookingData,
        service: servicesMap[booking.service_id] || null,
        customer: customersMap[booking.customer_id] || null
      }));
      
      // Transform to our Booking type
      return bookingsWithRelations.map(item => {
        return {
          id: item.bookingData.id,
          serviceId: item.bookingData.service_id,
          customerId: item.bookingData.customer_id,
          status: item.bookingData.status,
          startTime: item.bookingData.start_time,
          endTime: item.bookingData.end_time,
          bookingReference: item.bookingData.booking_reference,
          specialRequests: item.bookingData.special_requests,
          createdAt: item.bookingData.created_at,
          service: item.service ? {
            id: item.service.id,
            name: item.service.name,
            vendorId: item.service.vendor_id
          } : null,
          customer: item.customer ? {
            id: item.customer.id,
            fullName: item.customer.full_name
          } : null
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
