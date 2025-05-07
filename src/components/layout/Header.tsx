import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
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

interface HeaderProps {
  children?: React.ReactNode;
  onCartOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ children, onCartOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [notifications, setNotifications] = useState<{ id: string; message: string; time: string }[]>([
    { id: '1', message: 'Welcome to ArtiJam!', time: '1 hour ago' },
    { id: '2', message: 'Your product was viewed 5 times today', time: '2 hours ago' }
  ]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleNotificationClick = (id: string) => {
    toast.success('Notification marked as read');
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    toast.success('All notifications cleared');
    setNotifications([]);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button or custom children */}
          {children || (
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ArtiJam Logo" className="h-8 w-8" />
            <span className="font-bold text-lg hidden sm:inline">ArtiJam</span>
          </Link>
        </div>
        
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search for products, services, or artists..." 
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-artijam-purple opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-artijam-purple"></span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="font-medium">Notifications</h3>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllNotifications}>
                    Clear all
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className="p-4 border-b last:border-0 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={onCartOpen}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 scale-75 bg-artijam-purple">
                {cartCount}
              </Badge>
            )}
          </Button>
          
          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url || ""} 
                      alt={user.email || "User"} 
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="bg-artijam-purple hover:bg-artijam-purple-dark"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
