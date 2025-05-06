
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import SideNavigation from "./SideNavigation";
import MobileDrawer from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Desktop Side Navigation - hidden on mobile */}
      <SideNavigation />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with mobile drawer integration */}
        <Header>
          {isMobile && <MobileDrawer />}
        </Header>
        
        {/* Main content area */}
        <main className="md:pl-64 pt-16 pb-20 md:pb-6 flex-1">
          <div className="p-2 sm:p-4 mx-auto max-w-7xl">
            <div className="bg-white rounded-lg shadow p-4">
              <Outlet />
            </div>
          </div>
        </main>
        
        {/* Mobile Navigation - only visible on mobile */}
        <MobileNavigation />
      </div>
    </div>
  );
};

export default AppLayout;
