
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import CartDrawer from "@/components/shop/CartDrawer";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

const GuestHeader = () => {
  const navigate = useNavigate();
  
  // Safely access cart count with fallback
  let cartCount = 0;
  try {
    const { cartCount: count } = useCart();
    cartCount = count;
  } catch (error) {
    console.log("Cart context not available");
  }

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo with slightly enhanced styling */}
        <div className="flex-shrink-0">
          <Logo size="md" className="hover:opacity-90 transition-opacity" />
        </div>

        <div className="flex-1 hidden md:flex md:justify-center">
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-artijam-purple focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <CartDrawer>
            <Button variant="outline" className="relative">
              <span className="mr-2">Cart</span>
              {cartCount > 0 && (
                <Badge className="bg-artijam-purple">{cartCount}</Badge>
              )}
            </Button>
          </CartDrawer>
          
          <Link to="/login">
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              <LogIn size={18} />
              <span>Sign In</span>
            </Button>
          </Link>
          
          <Link to="/register">
            <Button className="hidden md:flex items-center gap-2 bg-artijam-purple hover:bg-artijam-purple/90">
              <UserPlus size={18} />
              <span>Register</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default GuestHeader;
