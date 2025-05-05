
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VendorProfile = {
  id: string;
  business_name: string;
  business_description: string | null;
  business_type: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  website: string | null;
  is_verified: boolean | null;
  commission_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type VendorProfileFormData = Omit<VendorProfile, 'id' | 'is_verified' | 'commission_rate' | 'created_at' | 'updated_at'>;

export function useVendorProfile(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch vendor profile
  const { data: vendorProfile, isLoading, error } = useQuery({
    queryKey: ['vendorProfile', userId],
    queryFn: async () => {
      const profileId = userId || (await supabase.auth.getSession()).data.session?.user?.id;
      
      if (!profileId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No vendor profile found
          return null;
        }
        throw error;
      }
      
      return data as VendorProfile;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch vendor profile:', error);
        toast.error('Failed to load vendor profile. Please try again later.');
      }
    }
  });

  // Create vendor profile mutation
  const createVendorProfile = useMutation({
    mutationFn: async (formData: VendorProfileFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('vendor_profiles')
        .insert({
          id: session.session.user.id,
          ...formData,
        });
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Vendor profile created successfully.');
        queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      },
      onError: (error: Error) => {
        console.error('Failed to create vendor profile:', error);
        toast.error('Failed to create vendor profile. Please try again.');
      }
    }
  });

  // Update vendor profile mutation
  const updateVendorProfile = useMutation({
    mutationFn: async (formData: VendorProfileFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.session.user.id);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Vendor profile updated successfully.');
        queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      },
      onError: (error: Error) => {
        console.error('Failed to update vendor profile:', error);
        toast.error('Failed to update vendor profile. Please try again.');
      }
    }
  });

  return {
    vendorProfile,
    isLoading,
    error,
    createVendorProfile,
    updateVendorProfile,
  };
}
