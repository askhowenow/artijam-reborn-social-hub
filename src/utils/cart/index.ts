import { supabase } from '@/integrations/supabase/client';
import { CartData, CartItem } from '@/types/cart';

// Fetch cart data based on authentication status
export const fetchCartData = async (
  isAuthenticated: boolean,
  guestId: string | null
): Promise<CartData | null> => {
  try {
    if (isAuthenticated) {
      return await fetchUserCart();
    } else if (guestId) {
      return await fetchGuestCart(guestId);
    }
    return { cartId: '', items: [] };
  } catch (error) {
    console.error('Error fetching cart data:', error);
    return { cartId: '', items: [] };
  }
};

// Fetch user cart
async function fetchUserCart(): Promise<CartData | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) return null;

    const userId = session.session.user.id;
    
    // Get or create cart
    let { data: cartData, error: cartError } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (cartError) {
      throw cartError;
    }
    
    // If no cart exists, create one
    if (!cartData) {
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (createError) throw createError;
      cartData = newCart;
    }
    
    // Now get the cart items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from('user_cart_items')
      .select(`
        id, 
        quantity, 
        product_id,
        products!user_cart_items_product_id_fkey(
          id, 
          name, 
          description, 
          price, 
          image_url, 
          category,
          currency,
          stock_quantity,
          is_available
        )
      `)
      .eq('cart_id', cartData.id);
    
    if (itemsError) {
      console.error('Error getting user cart:', itemsError);
      return { cartId: cartData.id, items: [] };
    }
    
    // Transform the data to match our CartItem type
    const items = itemsData.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products
    })) as CartItem[];
    
    return {
      cartId: cartData.id,
      items
    };
  } catch (error) {
    console.error('Error getting user cart:', error);
    return null;
  }
}

// Fetch guest cart
async function fetchGuestCart(guestId: string): Promise<CartData | null> {
  try {
    // Get or create cart
    let { data: cartData, error: cartError } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .maybeSingle();
    
    if (cartError) {
      throw cartError;
    }
    
    // If no cart exists, create one
    if (!cartData) {
      const { data: newCart, error: createError } = await supabase
        .from('guest_carts')
        .insert({ guest_id: guestId })
        .select()
        .single();
      
      if (createError) throw createError;
      cartData = newCart;
    }
    
    // Now get the cart items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from('guest_cart_items')
      .select(`
        id, 
        quantity, 
        product_id,
        products!guest_cart_items_product_id_fkey(
          id, 
          name, 
          description, 
          price, 
          image_url, 
          category,
          currency,
          stock_quantity,
          is_available
        )
      `)
      .eq('cart_id', cartData.id);
    
    if (itemsError) {
      console.error('Error getting guest cart:', itemsError);
      return { cartId: cartData.id, items: [] };
    }
    
    // Transform the data to match our CartItem type
    const items = itemsData.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products
    })) as CartItem[];
    
    return {
      cartId: cartData.id,
      items
    };
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return null;
  }
}

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

// Export cart operations
export { 
  addToCartOperation,
  removeFromCartOperation,
  updateQuantityOperation
} from './cartOperations';

// Export other cart operations
export * from './cartOperations';

// Calculate cart total based on items
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.quantity * (item.product.price || 0));
  }, 0);
};
