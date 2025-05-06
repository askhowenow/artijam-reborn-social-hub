
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Users, MessageSquare, BookOpen, Briefcase, 
  ShoppingBag, Wallet, Search, FileText, 
  Video, Group, Shield, Settings, Bell, Store, Calendar, FileText as PageIcon,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import Logo from "./Logo";
import { useUserRole } from "@/hooks/use-user-role";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthProvider";

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
  { path: "/funding", label: "Funding", icon: Wallet }, // Using Wallet icon as a substitute
  { path: "/reels", label: "Reels", icon: Video },
  { path: "/groups", label: "Groups", icon: Group },
];

const vendorNavLinks = [
  { path: "/vendor/dashboard", label: "Vendor Dashboard", icon: Store },
  { path: "/vendor/products", label: "My Products", icon: List },
  { path: "/vendor/services", label: "My Services", icon: Calendar },
  { path: "/vendor/bookings", label: "Manage Bookings", icon: Calendar },
  { path: "/vendor/products/new", label: "Add Product", icon: ShoppingBag },
];

const adminNavLinks = [
  { path: "/admin", label: "Admin Dashboard", icon: Shield },
  { path: "/moderator", label: "Moderator", icon: Shield },
];

const SideNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAdmin } = useUserRole();
  const { vendorProfile } = useVendorProfile();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const isVendor = !!vendorProfile;

  // Mock user data - would come from auth context in real app
  const userData = {
    name: "John Doe",
    avatar: "/placeholder.svg",
  };

  const myContentLinks = [
    { path: "/my-events", label: "My Events", icon: Calendar },
    { path: "/my-pages", label: "My Pages", icon: PageIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-gray-200 bg-white overflow-y-auto fixed left-0 top-0 z-10">
      <div className="p-4 border-b border-gray-200">
        <Logo size="md" />
      </div>

      <div className="p-4">
        <Link to="/profile" className="flex items-center space-x-3 mb-6">
          <Avatar>
            <img src={userData.avatar} alt={userData.name} />
          </Avatar>
          <div>
            <p className="font-medium">{userData.name}</p>
            <p className="text-xs text-gray-500">View Profile</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {mainNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPath === link.path || (link.path === '/shop' && currentPath.startsWith('/shop')) || (link.path === '/events' && currentPath.startsWith('/events'))
                  ? "bg-artijam-purple-light text-artijam-purple"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <link.icon size={18} className="mr-3" />
              {link.label}
              {link.path === '/shop' && cartCount > 0 && (
                <Badge className="ml-auto bg-artijam-purple">{cartCount}</Badge>
              )}
            </Link>
          ))}
        </div>

        {/* My Content Links - visible to authenticated users */}
        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
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
                >
                  <link.icon size={18} className="mr-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Vendor Links - only visible to vendors */}
        {isVendor && (
          <div className="mt-6 pt-6 border-t border-gray-200">
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
                      link.path === "/vendor/services" && 
                      currentPath.startsWith("/vendor/services")
                    ) || (
                      link.path === "/vendor/bookings" && 
                      currentPath.startsWith("/vendor/bookings")
                    )
                      ? "bg-artijam-purple-light text-artijam-purple"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <link.icon size={18} className="mr-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
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
              >
                <link.icon size={18} className="mr-3" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Admin links - only visible to admins */}
        {isAdmin() && (
          <div className="mt-6 pt-6 border-t border-gray-200">
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
                >
                  <link.icon size={18} className="mr-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <Settings size={18} className="mr-3" />
          Settings
        </Link>
      </div>
    </aside>
  );
};

export default SideNavigation;
