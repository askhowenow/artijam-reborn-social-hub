
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter, 
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, Minus, Plus, Trash2, LogIn } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface CartDrawerProps {
  children?: React.ReactNode;
}

const CartDrawer = ({ children }: CartDrawerProps) => {
  const { 
    cart, 
    cartCount, 
    cartTotal, 
    isLoading, 
    removeFromCart, 
    updateQuantity,
    isAuthenticated
  } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      navigate('/login');
      return;
    }
    navigate('/shop/checkout');
  };
  
  if (isLoading) {
    return <div className="animate-pulse p-2">Loading...</div>;
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-artijam-purple text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({cartCount} items)</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <SheetClose asChild>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="link" 
                  className="mt-2"
                >
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product?.image_url ? (
                      <img 
                        src={item.product.image_url} 
                        alt={item.product?.name || 'Product'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${typeof item.product?.price === 'number' ? item.product.price.toFixed(2) : '0.00'}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity.mutate({ 
                              itemId: item.id, 
                              quantity: item.quantity - 1 
                            });
                          }
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="mx-2 text-sm">
                        {item.quantity}
                      </span>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => {
                          updateQuantity.mutate({ 
                            itemId: item.id, 
                            quantity: item.quantity + 1 
                          });
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-red-500" 
                    onClick={() => removeFromCart.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="mt-auto">
            <Separator />
            <div className="py-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              
              <SheetFooter className="flex flex-col gap-2 sm:flex-row">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </SheetClose>
                
                {isAuthenticated ? (
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
                  >
                    Checkout
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in to Checkout
                  </Button>
                )}
              </SheetFooter>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
