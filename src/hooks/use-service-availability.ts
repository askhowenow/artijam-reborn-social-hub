
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceAvailability = {
  id: string;
  service_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ServiceAvailabilityFormData = Omit<ServiceAvailability, 'id' | 'created_at' | 'updated_at'>;

export function useServiceAvailability(serviceId?: string) {
  const queryClient = useQueryClient();

  const { data: availabilities, isLoading, error } = useQuery({
    queryKey: ['service-availability', serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', serviceId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data as ServiceAvailability[];
    },
    enabled: !!serviceId,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch service availability:', error);
        toast.error('Failed to load availability. Please try again later.');
      }
    }
  });

  const createAvailability = useMutation({
    mutationFn: async (formData: ServiceAvailabilityFormData) => {
      const { data, error } = await supabase
        .from('service_availability')
        .insert(formData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    meta: {
      onSuccess: () => {
        toast.success('Availability added successfully.');
        queryClient.invalidateQueries({ queryKey: ['service-availability', serviceId] });
      },
      onError: (error: Error) => {
        console.error('Failed to add availability:', error);
        toast.error('Failed to add availability. Please try again.');
      }
    }
  });

  const updateAvailability = useMutation({
    mutationFn: async ({ id, ...formData }: ServiceAvailabilityFormData & { id: string }) => {
      const { error } = await supabase
        .from('service_availability')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Availability updated successfully.');
        queryClient.invalidateQueries({ queryKey: ['service-availability', serviceId] });
      },
      onError: (error: Error) => {
        console.error('Failed to update availability:', error);
        toast.error('Failed to update availability. Please try again.');
      }
    }
  });

  const deleteAvailability = useMutation({
    mutationFn: async (availabilityId: string) => {
      const { error } = await supabase
        .from('service_availability')
        .delete()
        .eq('id', availabilityId);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Availability deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['service-availability', serviceId] });
      },
      onError: (error: Error) => {
        console.error('Failed to delete availability:', error);
        toast.error('Failed to delete availability. Please try again.');
      }
    }
  });

  return {
    availabilities,
    isLoading,
    error,
    createAvailability,
    updateAvailability,
    deleteAvailability
  };
}
