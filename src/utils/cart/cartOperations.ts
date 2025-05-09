
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from '@/types/cart';

// Add item to cart (handles both user and guest carts)
export const addToCartOperation = async (
  productId: string,
  quantity: number,
  cartId: string,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<void> => {
  try {
    const table = isAuthenticated ? 'user_cart_items' : 'guest_cart_items';
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from(table)
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existingItem) {
      // Update quantity if item exists
      await supabase
        .from(table)
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item if it doesn't exist
      await supabase
        .from(table)
        .insert({ 
          cart_id: cartId,
          product_id: productId,
          quantity
        });
    }
    
    // Update product metrics
    await supabase.rpc('increment_product_metric', {
      product_id_param: productId,
      metric_name: 'cart_adds',
      increment_value: 1
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCartOperation = async (
  itemId: string,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<void> => {
  try {
    const table = isAuthenticated ? 'user_cart_items' : 'guest_cart_items';
    
    await supabase
      .from(table)
      .delete()
      .eq('id', itemId);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Update quantity of an item in the cart
export const updateQuantityOperation = async (
  itemId: string,
  quantity: number,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<void> => {
  try {
    const table = isAuthenticated ? 'user_cart_items' : 'guest_cart_items';
    
    await supabase
      .from(table)
      .update({ quantity })
      .eq('id', itemId);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
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
