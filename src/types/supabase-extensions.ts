
import { Database } from "@/integrations/supabase/types";

// Extend the Supabase Database types with our new tables
export interface ExtendedDatabase extends Database {
  Tables: Database["Tables"] & {
    payment_gateway_settings: {
      Row: {
        id: string;
        gateway_name: string;
        is_active: boolean;
        is_test_mode: boolean;
        credentials: Record<string, string>;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        gateway_name: string;
        is_active?: boolean;
        is_test_mode?: boolean;
        credentials: Record<string, string>;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        gateway_name?: string;
        is_active?: boolean;
        is_test_mode?: boolean;
        credentials?: Record<string, string>;
        created_at?: string;
        updated_at?: string;
      };
    };
    balances: {
      Row: {
        id: string;
        balance: number;
        currency: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id: string;
        balance?: number;
        currency?: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        balance?: number;
        currency?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
    transactions: {
      Row: {
        id: string;
        user_id: string;
        amount: number;
        currency: string;
        type: string;
        status: string;
        reference_id: string | null;
        gateway: string | null;
        gateway_reference: string | null;
        metadata: any | null;
        description: string | null;
        created_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        amount: number;
        currency?: string;
        type: string;
        status?: string;
        reference_id?: string | null;
        gateway?: string | null;
        gateway_reference?: string | null;
        metadata?: any | null;
        description?: string | null;
        created_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        amount?: number;
        currency?: string;
        type?: string;
        status?: string;
        reference_id?: string | null;
        gateway?: string | null;
        gateway_reference?: string | null;
        metadata?: any | null;
        description?: string | null;
        created_at?: string;
      };
    };
  };
}

// Create an extended supabase client type
export type ExtendedSupabaseClient = ReturnType<typeof createClient<ExtendedDatabase>>;

// Make sure createClient gets imported
import { createClient } from '@supabase/supabase-js';
