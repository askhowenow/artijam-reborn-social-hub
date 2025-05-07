
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceBookingFormData } from '@/types/booking';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: ServiceBookingFormData) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('You must be logged in to book a service');
      }
      
      // Check availability first
      const { data: available, error: availabilityError } = await supabase
        .rpc('check_service_availability', {
          p_service_id: bookingData.serviceId,
          p_start_time: bookingData.startTime,
          p_end_time: bookingData.endTime
        });
        
      if (availabilityError) {
        throw availabilityError;
      }
      
      if (!available) {
        throw new Error('This time slot is no longer available');
      }
      
      // Create the booking
      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          service_id: bookingData.serviceId,
          customer_id: user.user.id,
          start_time: bookingData.startTime,
          end_time: bookingData.endTime,
          status: 'confirmed',
          payment_status: 'pending',
          special_requests: bookingData.additionalData?.specialRequests,
          additional_data: bookingData.additionalData
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
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      },
      onError: (error: Error) => {
        toast.error(`Booking failed: ${error.message}`);
      }
    }
  });
};
