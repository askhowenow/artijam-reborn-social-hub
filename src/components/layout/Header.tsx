
import React from "react";
import Logo from "./Logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import SearchBar from "./search/SearchBar";
import NotificationsDropdown from "./notifications/NotificationsDropdown";
import UserMenuDropdown from "./user/UserMenuDropdown";
import CartButton from "./cart/CartButton";

interface HeaderProps {
  children?: React.ReactNode;
  onCartOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ children, onCartOpen }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button or custom children */}
          {children || (
            <div className="md:hidden">
              {/* Placeholder for mobile menu button */}
            </div>
          )}
          
          {/* Logo */}
          <Logo size="sm" />
        </div>
        
        {/* Search */}
        <SearchBar />
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationsDropdown />
          
          {/* Cart */}
          <CartButton onClick={onCartOpen} />
          
          {/* User Menu */}
          <UserMenuDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
