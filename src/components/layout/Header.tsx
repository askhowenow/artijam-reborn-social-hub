
import React from "react";
import { Link } from "react-router-dom";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-20">
      <div className="flex items-center justify-between h-16 px-4 md:pl-64 md:pr-8">
        {isMobile && (
          <Link to="/" className="text-xl font-bold text-artijam-purple">
            Artijam
          </Link>
        )}

        <div className="flex-1 md:flex md:justify-center">
          {!isMobile && (
            <div className="max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-artijam-purple focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/post">
            <Button variant="outline" size="icon" className="rounded-full">
              <Plus size={18} />
            </Button>
          </Link>
          <Link to="/notifications">
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell size={18} />
            </Button>
          </Link>
          <Link to="/profile" className="hidden md:block">
            <Avatar className="w-8 h-8">
              <img src="/placeholder.svg" alt="Profile" />
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
