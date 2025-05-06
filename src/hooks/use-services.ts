
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Service = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  category: string | null;
  location_type: string;
  preparation_time: number | null;
  cleanup_time: number | null;
  is_available: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ServiceFormData = Omit<Service, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>;

export function useServices(vendorId?: string) {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', vendorId],
    queryFn: async () => {
      // If no vendorId is provided, get the current user's id
      const profileId = vendorId || (await supabase.auth.getSession()).data.session?.user?.id;
      
      if (!profileId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Service[];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services. Please try again later.');
      }
    }
  });

  const createService = useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('services')
        .insert({
          vendor_id: session.session.user.id,
          ...formData,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    meta: {
      onSuccess: () => {
        toast.success('Service created successfully.');
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
      onError: (error: Error) => {
        console.error('Failed to create service:', error);
        toast.error('Failed to create service. Please try again.');
      }
    }
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...formData }: ServiceFormData & { id: string }) => {
      const { error } = await supabase
        .from('services')
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
        toast.success('Service updated successfully.');
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
      onError: (error: Error) => {
        console.error('Failed to update service:', error);
        toast.error('Failed to update service. Please try again.');
      }
    }
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Service deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
      onError: (error: Error) => {
        console.error('Failed to delete service:', error);
        toast.error('Failed to delete service. Please try again.');
      }
    }
  });

  return {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService
  };
}

export function useServiceDetails(serviceId?: string) {
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      
      return data as Service;
    },
    enabled: !!serviceId,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch service details:', error);
        toast.error('Failed to load service details. Please try again later.');
      }
    }
  });

  return { service, isLoading, error };
}
