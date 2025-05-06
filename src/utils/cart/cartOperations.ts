
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from '@/types/cart';
import { getUserCart } from './userCart';
import { getGuestCart, addToGuestCart } from './guestCart';
import { addToUserCart } from './userCart';

// Update cart item quantity
export const updateCartItemQuantity = async (
  itemId: string, 
  quantity: number, 
  isUserCart: boolean
): Promise<void> => {
  try {
    const table = isUserCart ? 'user_cart_items' : 'guest_cart_items';
    
    await supabase
      .from(table)
      .update({ quantity })
      .eq('id', itemId);
  } catch (error) {
    console.error(`Error updating ${isUserCart ? 'user' : 'guest'} cart item quantity:`, error);
    throw error;
  }
};

// Remove item from cart
export const removeCartItem = async (
  itemId: string, 
  isUserCart: boolean
): Promise<void> => {
  try {
    const table = isUserCart ? 'user_cart_items' : 'guest_cart_items';
    
    await supabase
      .from(table)
      .delete()
      .eq('id', itemId);
  } catch (error) {
    console.error(`Error removing item from ${isUserCart ? 'user' : 'guest'} cart:`, error);
    throw error;
  }
};

// Calculate total price of cart items
export const calculateCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Calculate total items count
export const calculateCartCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};
