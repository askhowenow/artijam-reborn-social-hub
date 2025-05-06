
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/cart";
import { Trash2, Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/string-utils";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
  isAuthenticated: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onOpenChange,
  cart,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  isAuthenticated,
}) => {
  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Calculate total number of items
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart ({itemCount} items)</SheetTitle>
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
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onUpdateQuantity(
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
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => onRemoveItem(item.id)}
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
                <span>{formatPrice(cartTotal, "USD")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(cartTotal, "USD")}</span>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button onClick={onCheckout} className="w-full">
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
