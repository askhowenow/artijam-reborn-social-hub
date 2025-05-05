
import { createClient } from '@supabase/supabase-js';

// Default to empty strings if environment variables are not available
// This allows the app to at least load without crashing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a placeholder Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-url.supabase.co'
  );
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not properly configured. Authentication features will not work.');
    return null;
  }
  
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
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not properly configured. User profile features will not work.');
    return null;
  }
  
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
