
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceBooking = {
  id: string;
  service_id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: string;
  special_requests: string | null;
  customer_notes: string | null;
  payment_status: string | null;
  booking_reference: string | null;
  qr_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  customer?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  service?: {
    name: string;
    vendor_id: string;
  };
};

export type ServiceBookingFormData = Omit<ServiceBooking, 'id' | 'customer_id' | 'booking_reference' | 'qr_code' | 'created_at' | 'updated_at' | 'customer' | 'service'>;

export function useVendorBookings(vendorId?: string) {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['vendor-bookings', vendorId],
    queryFn: async () => {
      // If no vendorId is provided, get the current user's id
      const profileId = vendorId || (await supabase.auth.getSession()).data.session?.user?.id;
      
      if (!profileId) {
        throw new Error('User not authenticated');
      }
      
      // Get bookings for all services provided by this vendor
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          customer:customer_id(full_name, avatar_url, username),
          service:service_id(name, vendor_id)
        `)
        .eq('service:vendor_id', profileId)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our type
      const transformedData = data.map(booking => ({
        ...booking,
        customer: booking.customer || {
          full_name: null,
          avatar_url: null,
          username: null
        },
        service: booking.service || {
          name: '',
          vendor_id: ''
        }
      })) as ServiceBooking[];
      
      return transformedData;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch bookings:', error);
        toast.error('Failed to load bookings. Please try again later.');
      }
    }
  });

  const queryClient = useQueryClient();

  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Booking status updated successfully.');
        queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      },
      onError: (error: Error) => {
        console.error('Failed to update booking status:', error);
        toast.error('Failed to update booking status. Please try again.');
      }
    }
  });

  return {
    bookings,
    isLoading,
    error,
    updateBookingStatus
  };
}

export function useCustomerBookings() {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service:service_id(name, vendor_id, 
            vendor:vendor_id(business_name, business_type, is_verified))
        `)
        .eq('customer_id', session.session.user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data as ServiceBooking[];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch customer bookings:', error);
        toast.error('Failed to load your bookings. Please try again later.');
      }
    }
  });

  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async (formData: ServiceBookingFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          ...formData,
          customer_id: session.session.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    meta: {
      onSuccess: () => {
        toast.success('Booking created successfully.');
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      },
      onError: (error: Error) => {
        console.error('Failed to create booking:', error);
        toast.error('Failed to create booking. Please try again.');
      }
    }
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Booking cancelled successfully.');
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      },
      onError: (error: Error) => {
        console.error('Failed to cancel booking:', error);
        toast.error('Failed to cancel booking. Please try again.');
      }
    }
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    cancelBooking
  };
}
