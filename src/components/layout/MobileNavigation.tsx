
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, BookOpen, Briefcase, ShoppingBag, Wallet, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation links data
const navLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/people", label: "People", icon: Users },
  { path: "/messages", label: "Chat", icon: MessageSquare },
  { path: "/courses", label: "Learn", icon: BookOpen },
  { path: "/search", label: "Search", icon: Search },
];

const MobileNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors",
              currentPath === link.path
                ? "text-artijam-purple"
                : "text-gray-500 hover:text-artijam-purple"
            )}
          >
            <link.icon size={20} />
            <span className="mt-1">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
