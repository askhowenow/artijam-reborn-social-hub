import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, PlusCircle, Bell, User, Store } from "lucide-react";
import { useVendorProfile } from "@/hooks/use-vendor-profile";

const MobileNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { vendorProfile } = useVendorProfile();
  const isVendor = !!vendorProfile;

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 pb-safe-area">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          pathname === "/" ? "text-artijam-purple" : "text-gray-600"
        )}>
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/people" className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          pathname === "/people" ? "text-artijam-purple" : "text-gray-600"
        )}>
          <Users size={20} />
          <span className="text-xs mt-1">People</span>
        </Link>
        
        <Link to="/post/create" className="flex flex-col items-center justify-center w-full h-full">
          <div className="bg-artijam-purple rounded-full p-3">
            <PlusCircle size={20} className="text-white" />
          </div>
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
          pathname === "/profile" ? "text-artijam-purple" : "text-gray-600"
        )}>
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
