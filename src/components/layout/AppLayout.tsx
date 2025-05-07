
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import SideNavigation from "./SideNavigation";
import MobileDrawer from "./MobileDrawer";
import CartDrawer from "@/components/shop/CartDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isShopPage = location.pathname === '/shop' || location.pathname.startsWith('/shop/');
  
  const handleCartOpen = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Desktop Side Navigation - hidden on mobile */}
      <SideNavigation />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with mobile drawer integration */}
        <Header 
          onCartOpen={handleCartOpen}
        >
          {isMobile && <MobileDrawer />}
        </Header>
        
        {/* Main content area */}
        <main className="md:pl-64 pt-16 pb-24 md:pb-6 flex-1">
          <div className={`p-1 sm:p-4 mx-auto max-w-7xl ${isShopPage ? 'px-0 sm:px-4' : ''}`}>
            <div className={`bg-white rounded-lg shadow ${isShopPage ? 'p-1 sm:p-4' : 'p-2 sm:p-4'}`}>
              <Outlet />
            </div>
          </div>
        </main>
        
        {/* Mobile Navigation - only visible on mobile */}
        <MobileNavigation />
        
        {/* Cart Drawer - app-wide component */}
        <CartDrawer 
          open={isCartOpen}
          onOpenChange={setIsCartOpen}
        />
      </div>
    </div>
  );
};

export default AppLayout;
