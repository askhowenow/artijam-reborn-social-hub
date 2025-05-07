
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
              Start selling your creations on Artijam's marketplace
            </p>
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
