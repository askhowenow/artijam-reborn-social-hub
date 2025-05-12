
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { ExtendedSupabaseClient } from '@/types/supabase-extensions';

export interface Balance {
  id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'top_up' | 'payment' | 'refund' | 'withdrawal';
  status: string;
  reference_id: string | null;
  gateway: string | null;
  gateway_reference: string | null;
  description: string | null;
  created_at: string;
  metadata: any | null;
}

export interface TopUpRequest {
  amount: number;
  currency: string;
  paymentDetails: {
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
    [key: string]: any;
  };
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export function useBalance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Cast supabase client to our extended type
  const extendedSupabase = supabase as unknown as ExtendedSupabaseClient;

  const fetchBalance = async (): Promise<Balance> => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase.functions.invoke('get-balance');
    
    if (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
    
    return data.balance;
  };

  const topUpBalance = async (request: TopUpRequest): Promise<any> => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase.functions.invoke('top-up-balance', {
      body: request
    });
    
    if (error) {
      console.error('Error topping up balance:', error);
      throw error;
    }
    
    return data;
  };

  const fetchTransactions = async ({ 
    limit = 10, 
    offset = 0, 
    type 
  }: { 
    limit?: number; 
    offset?: number; 
    type?: string;
  } = {}): Promise<TransactionListResponse> => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    let url = `limit=${limit}&offset=${offset}`;
    if (type) url += `&type=${type}`;
    
    const { data, error } = await supabase.functions.invoke('get-transactions', {
      body: { limit, offset, type }
    });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return data;
  };

  const balanceQuery = useQuery({
    queryKey: ['balance'],
    queryFn: fetchBalance,
    enabled: !!user,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Error fetching balance',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  const transactionsQuery = (options: { 
    limit?: number; 
    offset?: number; 
    type?: string; 
  } = {}) => useQuery({
    queryKey: ['transactions', options],
    queryFn: () => fetchTransactions(options),
    enabled: !!user,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Error fetching transactions',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  const topUpMutation = useMutation({
    mutationFn: topUpBalance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      toast({
        title: 'Balance topped up successfully',
        description: data.isTestTransaction ? 'This was a test transaction' : 'Your balance has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Top-up failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    balance: balanceQuery.data,
    isLoadingBalance: balanceQuery.isLoading,
    balanceError: balanceQuery.error,
    refetchBalance: balanceQuery.refetch,
    
    topUpBalance: topUpMutation.mutate,
    isProcessingTopUp: topUpMutation.isPending,
    
    transactionsQuery,
  };
}
