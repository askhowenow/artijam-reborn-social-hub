
import React, { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/cart";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/string-utils";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  children?: React.ReactNode;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartCount, 
    cartTotal, 
    isAuthenticated 
  } = useCart();

  const handleRemoveItem = (itemId: string) => {
    removeFromCart.mutate(itemId);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateQuantity.mutate({ itemId, quantity });
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=checkout");
    }
    setOpen(false);
  };

  // Default trigger if none provided
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <ShoppingCart className="h-4 w-4" />
      <span className="sr-only sm:not-sr-only">Cart</span>
      {cartCount > 0 && (
        <Badge className="ml-1 bg-artijam-purple">{cartCount}</Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart ({cartCount} items)</SheetTitle>
          <SheetDescription>
            Review items in your cart before checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <SheetClose asChild>
                <Button variant="default" className="mt-4">
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={item.product.image_url || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.product.price, item.product.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal, "USD")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(cartTotal, "USD")}</span>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button onClick={handleCheckout} className="w-full">
                {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
