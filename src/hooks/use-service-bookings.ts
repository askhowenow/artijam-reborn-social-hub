
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Booking = {
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
};

export type ServiceBookingFormData = {
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  special_requests?: string;
  customer_notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
};

export const useCustomerBookings = () => {
  const queryClient = useQueryClient();

  // Fetch customer bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service:service_id(
            id,
            name,
            vendor_id
          )
        `)
        .eq('customer_id', user.user.id)
        .order('start_time', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data as Booking[];
    }
  });
  
  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
        
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
    onError: (error) => {
      toast.error(`Failed to cancel booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    bookings,
    isLoading,
    error,
    cancelBooking
  };
};

export const useVendorBookings = () => {
  const queryClient = useQueryClient();

  // Fetch vendor bookings
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
      
      return data as unknown as Booking[];
    }
  });
  
  // Update booking status mutation
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
    onSuccess: (_, variables) => {
      toast.success(`Booking ${variables.status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
    },
    onError: (error) => {
      toast.error(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    bookings,
    isLoading,
    error,
    updateBookingStatus
  };
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  const createBooking = useMutation({
    mutationFn: async (bookingData: ServiceBookingFormData) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          ...bookingData,
          customer_id: user.user.id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Booking created successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
    onError: (error) => {
      toast.error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    createBooking
  };
};
