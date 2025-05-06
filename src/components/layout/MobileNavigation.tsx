
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, PlusCircle, User, Store, ShoppingBag, Calendar } from "lucide-react";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

const MobileNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { vendorProfile } = useVendorProfile();
  const { cartCount } = useCart();
  const isVendor = !!vendorProfile;

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 pb-safe-area shadow-lg">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          pathname === "/" ? "text-artijam-purple" : "text-gray-600"
        )}>
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/shop" className={cn(
          "flex flex-col items-center justify-center w-full h-full relative",
          pathname === "/shop" || pathname.startsWith("/shop/") ? "text-artijam-purple" : "text-gray-600"
        )}>
          <ShoppingBag size={20} />
          <span className="text-xs mt-1">Shop</span>
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 scale-75 bg-artijam-purple">
              {cartCount}
            </Badge>
          )}
        </Link>
        
        <Link to="/post/create" className="flex flex-col items-center justify-center w-full h-full">
          <div className="bg-artijam-purple rounded-full p-3">
            <PlusCircle size={20} className="text-white" />
          </div>
        </Link>
        
        <Link to="/my-bookings" className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          pathname === "/my-bookings" || pathname.startsWith("/my-bookings/") ? "text-artijam-purple" : "text-gray-600"
        )}>
          <Calendar size={20} />
          <span className="text-xs mt-1">Bookings</span>
        </Link>
        
        {isVendor && (
          <Link to="/vendor/dashboard" className={cn(
            "flex flex-col items-center justify-center w-full h-full",
            pathname.startsWith("/vendor") ? "text-artijam-purple" : "text-gray-600"
          )}>
            <Store size={20} />
            <span className="text-xs mt-1">Vendor</span>
          </Link>
        )}
        
        <Link to="/profile" className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          pathname === "/profile" || pathname.startsWith("/profile/") ? "text-artijam-purple" : "text-gray-600"
        )}>
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
