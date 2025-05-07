
import React from "react";
import { Link } from "react-router-dom";
import { Bell, Search, ShoppingBag, PlusCircle, Video } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import CartDrawer from "@/components/shop/CartDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthProvider";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center">
          {/* Mobile Menu Trigger - Rendered via children prop for flexibility */}
          <div className="md:hidden mr-2">
            {children}
          </div>
          
          {/* Logo - visible on both mobile and desktop */}
          <Logo size={window.innerWidth < 768 ? "sm" : "md"} />
        </div>

        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-artijam-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Cart Button - Positioned for visibility */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-artijam-purple">
                {cartCount}
              </Badge>
            )}
          </Button>
          
          {user && (
            <>
              <Link to="/streams">
                <Button variant="ghost" size="icon" className="relative">
                  <Video size={20} />
                </Button>
              </Link>
              <Link to="/vendor/products/new">
                <Button variant="ghost" size="icon" className="relative">
                  <PlusCircle size={20} />
                </Button>
              </Link>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-artijam-purple">
              2
            </Badge>
          </Button>
        </div>
      </div>
      
      <CartDrawer 
        open={isCartOpen} 
        onOpenChange={setIsCartOpen} 
      />
    </header>
  );
};

export default Header;
