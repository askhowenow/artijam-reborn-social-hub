
import { CartData, CartItem } from '@/types/cart';
import { supabase } from "@/integrations/supabase/client";
import { getUserCart } from './userCart';
import { getGuestCart, addToGuestCart } from './guestCart';
import { addToUserCart } from './userCart';

// Fetch cart data based on authentication status
export const fetchCartData = async (
  isAuthenticated: boolean,
  guestId: string | null
): Promise<CartData> => {
  if (isAuthenticated) {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User session not found');
    }
    
    const userId = session.session.user.id;
    const items = await getUserCart(userId);
    
    // Get or create user cart ID
    let { data: userCart } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!userCart) {
      const { data: newCart } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
        
      userCart = newCart;
    }
    
    return {
      cartId: userCart?.id || '',
      items
    };
  } else if (guestId) {
    const items = await getGuestCart(guestId);
    
    // Get or create guest cart ID
    let { data: guestCart } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();
      
    if (!guestCart) {
      const { data: newCart } = await supabase
        .from('guest_carts')
        .insert({ guest_id: guestId })
        .select('id')
        .single();
        
      guestCart = newCart;
    }
    
    return {
      cartId: guestCart?.id || '',
      items
    };
  }
  
  return {
    cartId: '',
    items: []
  };
};

// Add product to cart operation
export const addToCartOperation = async (
  productId: string,
  quantity: number,
  cartId: string,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<CartItem[]> => {
  if (isAuthenticated) {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User session not found');
    }
    
    const userId = session.session.user.id;
    return await addToUserCart(userId, productId, quantity);
  } else if (guestId) {
    return await addToGuestCart(guestId, productId, quantity);
  }
  
  throw new Error('Authentication or guest ID required');
};

// Remove from cart operation
export const removeFromCartOperation = async (
  itemId: string,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<void> => {
  if (!itemId) throw new Error('Item ID is required');
  
  const { removeCartItem } = await import('./cartOperations');
  return await removeCartItem(itemId, isAuthenticated);
};

// Update quantity operation
export const updateQuantityOperation = async (
  itemId: string,
  quantity: number,
  isAuthenticated: boolean,
  guestId: string | null
): Promise<void> => {
  if (!itemId) throw new Error('Item ID is required');
  if (quantity < 1) throw new Error('Quantity must be at least 1');
  
  const { updateCartItemQuantity } = await import('./cartOperations');
  return await updateCartItemQuantity(itemId, quantity, isAuthenticated);
};

// Re-export all the functions for backward compatibility
export { getUserCart } from './userCart';
export { getGuestCart, getGuestId } from './guestCart';
export { calculateCartTotal, calculateCartCount } from './cartOperations';
export { syncGuestCartToUserCart } from './userCart';
