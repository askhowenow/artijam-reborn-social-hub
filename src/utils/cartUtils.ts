
import { supabase } from "@/integrations/supabase/client";
import { CartItem, CartData } from "@/types/cart";
import { v4 as uuidv4 } from 'uuid';

// Generate client ID for guest cart
export const getGuestId = (): string => {
  let guestId = localStorage.getItem('guest_id');
  
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('guest_id', guestId);
  }
  
  return guestId;
};

// Get user cart
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    // First check if user has a cart
    let { data: userCart } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    // Create a cart if one doesn't exist
    if (!userCart) {
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      
      if (createError) throw createError;
      userCart = newCart;
    }
    
    // Now get cart items with product details
    const { data: cartItems, error: itemsError } = await supabase
      .from('user_cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products!inner(*)
      `)
      .eq('cart_id', userCart.id);
    
    if (itemsError) throw itemsError;
    
    return cartItems as unknown as CartItem[];
  } catch (error) {
    console.error('Error getting user cart:', error);
    return [];
  }
};

// Get guest cart
export const getGuestCart = async (guestId: string): Promise<CartItem[]> => {
  try {
    // First check if guest has a cart
    let { data: guestCart } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();
    
    // Create a cart if one doesn't exist
    if (!guestCart) {
      const { data: newCart, error: createError } = await supabase
        .from('guest_carts')
        .insert({ guest_id: guestId })
        .select('id')
        .single();
      
      if (createError) throw createError;
      guestCart = newCart;
    }
    
    // Now get cart items with product details
    const { data: cartItems, error: itemsError } = await supabase
      .from('guest_cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products!inner(*)
      `)
      .eq('cart_id', guestCart.id);
    
    if (itemsError) throw itemsError;
    
    return cartItems as unknown as CartItem[];
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return [];
  }
};

// Add item to user cart
export const addToUserCart = async (
  userId: string, 
  productId: string,
  quantity: number = 1
): Promise<CartItem[]> => {
  try {
    // Get or create user cart
    let { data: userCart } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!userCart) {
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      
      if (createError) throw createError;
      userCart = newCart;
    }
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('user_cart_items')
      .select('id, quantity')
      .eq('cart_id', userCart.id)
      .eq('product_id', productId)
      .single();
    
    if (existingItem) {
      // Update quantity if item exists
      await supabase
        .from('user_cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item if it doesn't exist
      await supabase
        .from('user_cart_items')
        .insert({ 
          cart_id: userCart.id,
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
    
    // Get updated cart
    return await getUserCart(userId);
  } catch (error) {
    console.error('Error adding to user cart:', error);
    throw error;
  }
};

// Add item to guest cart
export const addToGuestCart = async (
  guestId: string, 
  productId: string,
  quantity: number = 1
): Promise<CartItem[]> => {
  try {
    // Get or create guest cart
    let { data: guestCart } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();
    
    if (!guestCart) {
      const { data: newCart, error: createError } = await supabase
        .from('guest_carts')
        .insert({ guest_id: guestId })
        .select('id')
        .single();
      
      if (createError) throw createError;
      guestCart = newCart;
    }
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('guest_cart_items')
      .select('id, quantity')
      .eq('cart_id', guestCart.id)
      .eq('product_id', productId)
      .single();
    
    if (existingItem) {
      // Update quantity if item exists
      await supabase
        .from('guest_cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item if it doesn't exist
      await supabase
        .from('guest_cart_items')
        .insert({ 
          cart_id: guestCart.id,
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
    
    // Get updated cart
    return await getGuestCart(guestId);
  } catch (error) {
    console.error('Error adding to guest cart:', error);
    throw error;
  }
};

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

// Sync guest cart to user cart after login
export const syncGuestCartToUserCart = async (
  userId: string, 
  guestId: string
): Promise<CartItem[]> => {
  try {
    const guestCartItems = await getGuestCart(guestId);
    
    // Skip if guest cart is empty
    if (guestCartItems.length === 0) {
      return await getUserCart(userId);
    }
    
    // For each guest cart item, add to user cart
    for (const item of guestCartItems) {
      await addToUserCart(userId, item.product_id, item.quantity);
    }
    
    // Clear guest cart
    let { data: guestCart } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();
    
    if (guestCart) {
      await supabase
        .from('guest_cart_items')
        .delete()
        .eq('cart_id', guestCart.id);
    }
    
    // Return updated user cart
    return await getUserCart(userId);
  } catch (error) {
    console.error('Error syncing guest cart to user cart:', error);
    return [];
  }
};
