
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bed, Plane, Utensils, Ticket } from 'lucide-react';

interface VendorCTAProps {
  isAuthenticated: boolean;
}

const VendorCTA = ({ isAuthenticated }: VendorCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-3 xs:mb-4 sm:mb-6">
      <Card className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/5">
        <CardContent className="p-2 xs:p-3 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          <div>
            <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-0.5 xs:mb-1 sm:mb-2 text-center sm:text-left">Become a Vendor</h3>
            <p className="text-xs xs:text-sm text-gray-700 mb-2 xs:mb-3 sm:mb-0 text-center sm:text-left">
              Start selling your creations or services on Artijam's marketplace
            </p>
            <div className="hidden sm:flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Bed className="h-4 w-4 text-artijam-purple" /> Accommodations
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Plane className="h-4 w-4 text-artijam-purple" /> Travel
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Utensils className="h-4 w-4 text-artijam-purple" /> Food
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Ticket className="h-4 w-4 text-artijam-purple" /> Attractions
              </div>
            </div>
          </div>
          <Button 
            className="bg-artijam-purple hover:bg-artijam-purple/90 w-full sm:w-auto text-xs xs:text-sm py-1.5 xs:py-2 h-auto min-h-[32px] xs:min-h-[36px]"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                navigate('/vendor/profile');
              }
            }}
          >
            {isAuthenticated ? 'Start Selling' : 'Sign in to Start Selling'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCTA;
