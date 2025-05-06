
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceBookingFormData } from '@/types/booking';

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
    meta: {
      onSuccess: () => {
        toast.success('Booking created successfully');
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to create booking: ${error.message}`);
      }
    }
  });
  
  return {
    createBooking
  };
};
