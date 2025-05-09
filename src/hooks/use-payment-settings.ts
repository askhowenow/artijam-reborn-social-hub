import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { useUserRole } from '@/hooks/use-user-role';

export interface PaymentGatewaySettings {
  id: string;
  gateway_name: string;
  is_active: boolean;
  is_test_mode: boolean;
  credentials: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export function usePaymentSettings() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const fetchPaymentSettings = async (): Promise<PaymentGatewaySettings[]> => {
    if (!user || !isAdmin()) {
      throw new Error("Unauthorized");
    }
    
    const { data, error } = await supabase
      .from('payment_gateway_settings')
      .select('*');
    
    if (error) {
      console.error('Error fetching payment settings:', error);
      throw error;
    }
    
    return data || [];
  };

  const updatePaymentSettings = async (settings: Partial<PaymentGatewaySettings> & { id?: string }): Promise<PaymentGatewaySettings> => {
    if (!user || !isAdmin()) {
      throw new Error("Unauthorized");
    }
    
    // If there's an ID, update existing record
    if (settings.id) {
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .update({
          gateway_name: settings.gateway_name,
          is_active: settings.is_active,
          is_test_mode: settings.is_test_mode,
          credentials: settings.credentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating payment settings:', error);
        throw error;
      }
      
      return data;
    } 
    // Otherwise, insert a new record
    else {
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .insert({
          gateway_name: settings.gateway_name || 'first_atlantic',
          is_active: settings.is_active !== undefined ? settings.is_active : false,
          is_test_mode: settings.is_test_mode !== undefined ? settings.is_test_mode : true,
          credentials: settings.credentials || {}
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating payment settings:', error);
        throw error;
      }
      
      return data;
    }
  };

  const settingsQuery = useQuery({
    queryKey: ['payment-settings'],
    queryFn: fetchPaymentSettings,
    enabled: !!user && isAdmin(),
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Error fetching payment settings',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: updatePaymentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: 'Payment settings updated',
        description: 'Payment gateway settings have been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update payment settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const getSettingsForGateway = (gatewayName: string = 'first_atlantic'): PaymentGatewaySettings | undefined => {
    return settingsQuery.data?.find(
      settings => settings.gateway_name === gatewayName
    );
  };

  return {
    settings: settingsQuery.data || [],
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    
    getSettingsForGateway,
  };
}
