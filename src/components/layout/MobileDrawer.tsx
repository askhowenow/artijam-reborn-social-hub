import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileDrawerProps {
  children?: React.ReactNode;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ children }) => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 z-50 border dark:border-gray-700" 
        side="bottom"
        sideOffset={8}
      >
        {user && (
          <>
            <div className="p-2">
              <Link to="/profile" className="flex items-center space-x-3 mb-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Avatar>
                  <img src={user.user_metadata?.avatar_url || "/placeholder.svg"} 
                      alt={user.email || "User"} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate max-w-[180px] overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100" title={user.email || ""}>
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
                </div>
              </Link>
            </div>
            <DropdownMenuSeparator className="dark:border-gray-700" />
          </>
        )}
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main Navigation
          </DropdownMenuLabel>
          {mainNavLinks.map((link) => (
            <DropdownMenuItem key={link.path} asChild>
              <Link
                to={link.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPath === link.path || 
                  (link.path === '/shop' && currentPath.startsWith('/shop')) || 
                  (link.path === '/events' && currentPath.startsWith('/events'))
                    ? "bg-artijam-purple-light text-artijam-purple dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <link.icon size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        {user && myContentLinks.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                My Content
              </DropdownMenuLabel>
              {myContentLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === link.path || currentPath.startsWith(link.path)
                        ? "bg-artijam-purple-light text-artijam-purple dark:bg-purple-900/30 dark:text-purple-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <link.icon size={18} className="mr-3 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        
        {isVendor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vendor
              </DropdownMenuLabel>
              {vendorNavLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link
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
                        ? "bg-artijam-purple-light text-artijam-purple dark:bg-purple-900/30 dark:text-purple-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <link.icon size={18} className="mr-3 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator className="dark:border-gray-700" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            More
          </DropdownMenuLabel>
          {secondaryNavLinks.map((link) => (
            <DropdownMenuItem key={link.path} asChild>
              <Link
                to={link.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPath === link.path
                    ? "bg-artijam-purple-light text-artijam-purple dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <link.icon size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        {isAdmin && isAdmin() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administration
              </DropdownMenuLabel>
              {adminNavLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === link.path
                        ? "bg-artijam-purple-light text-artijam-purple dark:bg-purple-900/30 dark:text-purple-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <link.icon size={18} className="mr-3 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator className="dark:border-gray-700" />
        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings size={18} className="mr-3 flex-shrink-0" />
            <span className="truncate">Settings</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileDrawer;
