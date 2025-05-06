
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Home, Users, PlusCircle, Bell, User, Store, ShoppingBag, Calendar,
  FileText, MessageSquare, BookOpen, Briefcase, Wallet, Video,
  Group, Shield, Settings, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useAuth } from "@/context/AuthProvider";
import { useUserRole } from "@/hooks/use-user-role";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface MobileDrawerProps {
  children?: React.ReactNode;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { vendorProfile } = useVendorProfile();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const isVendor = !!vendorProfile;

  const mainNavLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/shop", label: "Shop", icon: ShoppingBag },
    { path: "/people", label: "People", icon: Users },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/blogs", label: "Blogs", icon: FileText },
    { path: "/courses", label: "Courses", icon: BookOpen },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/my-bookings", label: "My Bookings", icon: Calendar },
  ];

  const secondaryNavLinks = [
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/funding", label: "Funding", icon: Wallet },
    { path: "/reels", label: "Reels", icon: Video },
    { path: "/groups", label: "Groups", icon: Group },
  ];

  const vendorNavLinks = [
    { path: "/vendor/dashboard", label: "Vendor Dashboard", icon: Store },
    { path: "/vendor/products", label: "My Products", icon: ShoppingBag },
    { path: "/vendor/services", label: "My Services", icon: Calendar },
    { path: "/vendor/bookings", label: "Manage Bookings", icon: Calendar },
    { path: "/vendor/products/new", label: "Add Product", icon: PlusCircle },
  ];

  const adminNavLinks = [
    { path: "/admin", label: "Admin Dashboard", icon: Shield },
    { path: "/moderator", label: "Moderator", icon: Shield },
  ];
  
  const myContentLinks = [
    { path: "/my-events", label: "My Events", icon: Calendar },
    { path: "/my-pages", label: "My Pages", icon: FileText },
  ];

  // Default trigger if none provided
  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
      <Menu className="h-5 w-5" />
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || defaultTrigger}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] overflow-y-auto">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        {user && (
          <div className="px-4 py-2">
            <Link to="/profile" className="flex items-center space-x-3 mb-3" onClick={() => setOpen(false)}>
              <Avatar>
                <img src={user.user_metadata?.avatar_url || "/placeholder.svg"} 
                     alt={user.email || "User"} />
              </Avatar>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </Link>
          </div>
        )}
        
        <div className="px-4 py-2">
          <div className="space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPath === link.path || 
                  (link.path === '/shop' && currentPath.startsWith('/shop')) || 
                  (link.path === '/events' && currentPath.startsWith('/events'))
                    ? "bg-artijam-purple-light text-artijam-purple"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setOpen(false)}
              >
                <link.icon size={18} className="mr-3" />
                {link.label}
              </Link>
            ))}
          </div>
          
          {user && (
            <>
              <Separator className="my-3" />
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                My Content
              </p>
              <div className="space-y-1">
                {myContentLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === link.path || currentPath.startsWith(link.path)
                        ? "bg-artijam-purple-light text-artijam-purple"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <link.icon size={18} className="mr-3" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}
          
          {isVendor && (
            <>
              <Separator className="my-3" />
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Vendor
              </p>
              <div className="space-y-1">
                {vendorNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === link.path || (
                        link.path === "/vendor/products" && 
                        (currentPath === "/vendor/products" || currentPath.startsWith("/vendor/products/"))
                      ) || (
                        link.path === "/vendor/bookings" && 
                        currentPath.startsWith("/vendor/bookings")
                      )
                        ? "bg-artijam-purple-light text-artijam-purple"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <link.icon size={18} className="mr-3" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}
          
          <Separator className="my-3" />
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            More
          </p>
          <div className="space-y-1">
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPath === link.path
                    ? "bg-artijam-purple-light text-artijam-purple"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setOpen(false)}
              >
                <link.icon size={18} className="mr-3" />
                {link.label}
              </Link>
            ))}
          </div>
          
          {isAdmin && isAdmin() && (
            <>
              <Separator className="my-3" />
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administration
              </p>
              <div className="space-y-1">
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === link.path
                        ? "bg-artijam-purple-light text-artijam-purple"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <link.icon size={18} className="mr-3" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 mt-auto border-t border-gray-200">
          <Link
            to="/settings"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <Settings size={18} className="mr-3" />
            Settings
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
