
// This file is deprecated. Use the client from @/integrations/supabase/client instead
import { supabase } from "@/integrations/supabase/client";

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
    return data?.session?.user;
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
