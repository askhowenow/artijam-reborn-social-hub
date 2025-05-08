
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash fragment
      const hashFragment = window.location.hash;
      
      // Handle the auth session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Check if there's a valid session
      if (data?.session) {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        navigate("/");
      } else {
        // This could happen if the callback didn't result in a session
        toast({
          title: "Authentication Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-artijam-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
