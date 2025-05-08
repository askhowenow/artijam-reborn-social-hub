
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVendorSubdomain = (vendorId?: string) => {
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Check if a subdomain is valid and available
  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    if (!subdomain || subdomain.length < 3) {
      setIsAvailable(null);
      return false;
    }

    setIsChecking(true);

    try {
      // First check if the subdomain is valid
      const { data: isValid, error: validError } = await supabase
        .rpc('validate_subdomain', { subdomain });
      
      if (validError) throw validError;
      if (!isValid) {
        setIsAvailable(false);
        return false;
      }

      // Check if the subdomain is in the reserved list
      const { data: reservedData, error: reservedError } = await supabase
        .from('reserved_subdomains')
        .select('subdomain')
        .eq('subdomain', subdomain)
        .maybeSingle();

      if (reservedError) throw reservedError;
      if (reservedData) {
        setIsAvailable(false);
        return false;
      }

      // Check if the subdomain is available (not used by other vendors)
      const { data: isAvailableData, error: availabilityError } = await supabase
        .rpc('is_subdomain_available', { check_subdomain: subdomain });
      
      if (availabilityError) throw availabilityError;
      
      setIsAvailable(!!isAvailableData);
      return !!isAvailableData;
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      setIsAvailable(null);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Update subdomain settings
  const updateSubdomain = useMutation({
    mutationFn: async ({ 
      subdomain, 
      usesSubdomain 
    }: { 
      subdomain: string; 
      usesSubdomain: boolean 
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          subdomain,
          uses_subdomain: usesSubdomain,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId || session.session.user.id);
      
      if (error) throw error;
      
      return { subdomain, usesSubdomain };
    },
    meta: {
      onSuccess: () => {
        toast.success('Subdomain settings updated successfully');
        queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      },
      onError: (error: Error) => {
        console.error('Failed to update subdomain settings:', error);
        toast.error('Failed to update subdomain settings. Please try again.');
      }
    }
  });

  return {
    isChecking,
    isAvailable,
    checkSubdomainAvailability,
    updateSubdomain,
  };
};
