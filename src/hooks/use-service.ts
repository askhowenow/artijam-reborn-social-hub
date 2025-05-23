
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Service } from './use-services';

// Extended Service type that includes vendor information
export interface ServiceWithVendor extends Service {
  vendor?: {
    id: string;
    business_name: string | null;
    description: string | null;
    logo_url: string | null;
    store_slug: string | null;
    location: string | null;
  } | null;
}

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
            store_slug,
            location
          )
        `)
        .eq('id', serviceId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // Fix the TypeScript error by checking if data.vendor is null before accessing its properties
      const vendorData = data.vendor && typeof data.vendor === 'object' && data.vendor !== null 
        ? data.vendor 
        : null;
      
      return {
        ...data,
        vendor: vendorData
      } as ServiceWithVendor;
    },
    enabled: !!serviceId
  });
  
  return {
    service,
    isLoading,
    error
  };
};
