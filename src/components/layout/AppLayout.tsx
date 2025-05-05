
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import SideNavigation from "./SideNavigation";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideNavigation />
      <Header />
      <main className="md:pl-64 pt-16 pb-16 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
};

export default AppLayout;
