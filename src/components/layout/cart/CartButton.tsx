
import React from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

interface CartButtonProps {
  onClick?: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ onClick }) => {
  const { cartCount } = useCart();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={onClick}
    >
      <ShoppingBag className="h-5 w-5" />
      {cartCount > 0 && (
        <Badge className="absolute -top-1 -right-1 scale-75 bg-artijam-purple">
          {cartCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
