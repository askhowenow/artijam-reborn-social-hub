
import React from "react";
import { Link } from "react-router-dom";
import { Bell, Search, ShoppingBag, PlusCircle, Video } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthProvider";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FileText, Calendar, Store } from "lucide-react";

interface HeaderProps {
  children?: React.ReactNode;
  onCartOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ children, onCartOpen }) => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { vendorProfile } = useVendorProfile();
  const isVendor = !!vendorProfile;
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-2 sm:px-4 h-full">
        <div className="flex items-center">
          {/* Mobile Menu Trigger - Rendered via children prop for flexibility */}
          <div className="md:hidden mr-2">
            {children}
          </div>
          
          {/* Logo - visible on both mobile and desktop */}
          <Logo size={window.innerWidth < 768 ? "sm" : "md"} />
        </div>

        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-artijam-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Cart Button - Positioned for visibility */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
            onClick={onCartOpen}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-artijam-purple">
                {cartCount}
              </Badge>
            )}
          </Button>
          
          {user && (
            <>
              <Link to="/streams">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Video size={20} />
                </Button>
              </Link>
              
              {/* Replace direct link with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <PlusCircle size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  alignOffset={-5}
                  sideOffset={10} 
                  className="bg-white w-48"
                >
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => window.location.href = '/post/create'}
                  >
                    <FileText className="h-4 w-4 text-artijam-purple" />
                    <span>Add Post</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => window.location.href = '/events/create'}
                  >
                    <Calendar className="h-4 w-4 text-artijam-purple" />
                    <span>Add Event</span>
                  </DropdownMenuItem>
                  
                  {isVendor && (
                    <>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => window.location.href = '/vendor/products/new'}
                      >
                        <ShoppingBag className="h-4 w-4 text-artijam-purple" />
                        <span>Add Product</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => window.location.href = '/vendor/services'}
                      >
                        <Store className="h-4 w-4 text-artijam-purple" />
                        <span>Add Service</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => window.location.href = '/vendor/streams/create'}
                      >
                        <Video className="h-4 w-4 text-artijam-purple" />
                        <span>Start Stream</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell size={20} />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-artijam-purple">
              2
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
