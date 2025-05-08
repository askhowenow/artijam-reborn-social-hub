
import React from 'react';
import CartDrawer from '@/components/shop/CartDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface ShopHeaderProps {
  isAuthenticated: boolean;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ isAuthenticated }) => {
  const { cartCount } = useCart();

  return (
    <>
      {/* Mobile header with cart - Only shown on mobile */}
      <div className="flex justify-between items-center md:hidden mb-3">
        <h1 className="text-xl font-bold">Shop</h1>
        {isAuthenticated && <CartDrawer />}
      </div>

      {/* Desktop cart button */}
      {isAuthenticated && (
        <div className="hidden md:flex justify-end mb-4">
          <CartDrawer>
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <Badge className="ml-1 bg-artijam-purple">{cartCount}</Badge>
              )}
            </Button>
          </CartDrawer>
        </div>
      )}
    </>
  );
};

export default ShopHeader;
