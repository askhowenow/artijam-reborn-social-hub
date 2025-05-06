
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from '@/types/cart';
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
