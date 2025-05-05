
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import GuestHeader from "./GuestHeader";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GuestLayout = () => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />
      <main className="min-h-screen pt-16 pb-16">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      
      {/* Sign in banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-artijam-purple/95 text-white p-3 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm md:text-base">
              Sign in to complete purchases, view order history, and access personalized offers.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-artijam-purple"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowBanner(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestLayout;
