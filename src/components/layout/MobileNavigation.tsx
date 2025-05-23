
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Store, ShoppingBag, Calendar, Video, MessageSquare, Briefcase } from "lucide-react";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import FloatingActionButton from "@/components/common/FloatingActionButton";

const MobileNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { vendorProfile } = useVendorProfile();
  const { cartCount } = useCart();
  const isVendor = !!vendorProfile;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:hidden z-10">
      <nav className="grid grid-cols-5 relative">
        <Link to="/" className={cn(
          "flex flex-col items-center justify-center py-2",
          pathname === "/" ? "text-artijam-purple" : "text-gray-600 dark:text-gray-400"
        )}>
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/shop" className={cn(
          "flex flex-col items-center justify-center py-2 relative",
          pathname === "/shop" || pathname.startsWith("/shop/") ? "text-artijam-purple" : "text-gray-600 dark:text-gray-400"
        )}>
          <ShoppingBag size={20} />
          <span className="text-xs mt-1">Shop</span>
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 scale-75 bg-artijam-purple">
              {cartCount}
            </Badge>
          )}
        </Link>
        
        <div className="flex justify-center items-end">
          <div className="h-7"></div> {/* Space for the floating button */}
        </div>
        
        <Link to="/messages" className={cn(
          "flex flex-col items-center justify-center py-2",
          pathname === "/messages" || pathname.startsWith("/messages/") ? "text-artijam-purple" : "text-gray-600 dark:text-gray-400"
        )}>
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        {isVendor && (
          <Link to="/vendor" className={cn(
            "flex flex-col items-center justify-center py-2",
            pathname.startsWith("/vendor") ? "text-artijam-purple" : "text-gray-600 dark:text-gray-400"
          )}>
            <Store size={20} />
            <span className="text-xs mt-1">Vendor</span>
          </Link>
        )}
        
        {!isVendor && (
          <Link to="/profile" className={cn(
            "flex flex-col items-center justify-center py-2",
            pathname === "/profile" || pathname.startsWith("/profile/") ? "text-artijam-purple" : "text-gray-600 dark:text-gray-400"
          )}>
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        )}
        
        {/* The FloatingActionButton is positioned absolutely and stays in the middle */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <FloatingActionButton />
        </div>
      </nav>
    </div>
  );
};

export default MobileNavigation;
