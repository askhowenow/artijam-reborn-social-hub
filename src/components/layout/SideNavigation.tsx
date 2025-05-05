import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Users, MessageSquare, BookOpen, Briefcase, 
  ShoppingBag, Wallet, Search, FileText, 
  Video, Group, Shield, Settings, Bell 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import Logo from "./Logo";

const mainNavLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/people", label: "People", icon: Users },
  { path: "/messages", label: "Messages", icon: MessageSquare },
  { path: "/blogs", label: "Blogs", icon: FileText },
  { path: "/courses", label: "Courses", icon: BookOpen },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/offers", label: "Marketplace", icon: ShoppingBag },
];

const secondaryNavLinks = [
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/funding", label: "Funding", icon: Wallet }, // Using Wallet icon as a substitute
  { path: "/reels", label: "Reels", icon: Video },
  { path: "/groups", label: "Groups", icon: Group },
  { path: "/moderator", label: "Moderator", icon: Shield },
];

const SideNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Mock user data - would come from auth context in real app
  const user = {
    name: "John Doe",
    avatar: "/placeholder.svg",
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-gray-200 bg-white overflow-y-auto fixed left-0 top-0 z-10">
      <div className="p-4 border-b border-gray-200">
        <Logo size="md" />
      </div>

      <div className="p-4">
        <Link to="/profile" className="flex items-center space-x-3 mb-6">
          <Avatar>
            <img src={user.avatar} alt={user.name} />
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
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
