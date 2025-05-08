
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";

const UserMenuDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (!user) {
    return (
      <Button 
        variant="default" 
        size="sm"
        className="bg-artijam-purple hover:bg-artijam-purple-dark dark:bg-artijam-purple-dark dark:hover:bg-artijam-purple"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sign Out Button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
      
      {/* User menu dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.user_metadata?.avatar_url || ""} 
                alt={user.email || "User"} 
              />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
          <DropdownMenuItem onClick={() => navigate("/profile")} className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")} className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
          <DropdownMenuItem onClick={handleLogout} className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenuDropdown;
