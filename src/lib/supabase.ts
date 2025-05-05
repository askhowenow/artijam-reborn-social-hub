
// This file is deprecated. Use the client from @/integrations/supabase/client instead
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

// Re-export for backward compatibility
export { supabase };

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // We're now using the proper client from integrations directory
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user ?? null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Helper function to get the current user's profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Helper function to check if a user has a specific role
export const hasRole = async (userId: string, role: Database['public']['Enums']['app_role']) => {
  try {
    const { data, error } = await supabase
      .rpc('has_role', { 
        user_id: userId,
        check_role: role
      });

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Helper function to get all roles for a user
export const getUserRoles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_roles', { 
        user_id: userId 
      });

    if (error) throw error;
    return data.map((item: { role: Database['public']['Enums']['app_role'] }) => item.role);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};
