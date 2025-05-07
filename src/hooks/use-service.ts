
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Service } from './use-services';

export const useService = (serviceId?: string) => {
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      if (!serviceId) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendor:vendor_id (
            id,
            business_name,
            description,
            logo_url,
            store_slug
          )
        `)
        .eq('id', serviceId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data as Service;
    },
    enabled: !!serviceId
  });
  
  return {
    service,
    isLoading,
    error
  };
};
