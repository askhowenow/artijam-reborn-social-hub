
import { supabase } from '@/integrations/supabase/client';
import { fetchGuestCart } from './fetchCart';

// Sync guest cart to user cart
export const syncGuestCartToUserCart = async (guestId: string): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('User not authenticated');
    
    const userId = session.session.user.id;
    
    // Get guest cart
    const guestCart = await fetchGuestCart(guestId);
    if (!guestCart || guestCart.items.length === 0) return;
    
    // Get or create user cart
    let { data: userCartData, error: userCartError } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (userCartError) throw userCartError;
    
    if (!userCartData) {
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (createError) throw createError;
      userCartData = newCart;
    }
    
    // Add guest cart items to user cart
    for (const item of guestCart.items) {
      // Check if product already exists in user cart
      const { data: existingItem, error: findError } = await supabase
        .from('user_cart_items')
        .select('id, quantity')
        .eq('cart_id', userCartData.id)
        .eq('product_id', item.product_id)
        .maybeSingle();
      
      if (findError) throw findError;
      
      if (existingItem) {
        // Update quantity
        await supabase
          .from('user_cart_items')
          .update({ quantity: existingItem.quantity + item.quantity })
          .eq('id', existingItem.id);
      } else {
        // Insert new item
        await supabase
          .from('user_cart_items')
          .insert({
            cart_id: userCartData.id,
            product_id: item.product_id,
            quantity: item.quantity
          });
      }
    }
    
    // Clear guest cart
    await supabase
      .from('guest_cart_items')
      .delete()
      .eq('cart_id', guestCart.cartId);
      
  } catch (error) {
    console.error('Error syncing guest cart to user cart:', error);
    throw error;
  }
};
