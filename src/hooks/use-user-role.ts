
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

type Role = Database['public']['Enums']['app_role'];

export function useUserRole() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.user) {
          setRoles([]);
          return;
        }
        
        // Get user roles
        const { data, error } = await supabase
          .rpc('get_user_roles', { 
            user_id: sessionData.session.user.id 
          });
          
        if (error) throw error;
        
        setRoles(data.map(item => item.role));
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });
    
    // Initial fetch
    fetchUserRoles();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: Role) => {
    return roles.includes(role);
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isModerator = () => {
    return hasRole('moderator');
  };

  return {
    roles,
    isLoading,
    error,
    hasRole,
    isAdmin,
    isModerator
  };
}
