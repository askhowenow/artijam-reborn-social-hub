
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
export async function fetchUserCart(): Promise<CartData | null> {
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
export async function fetchGuestCart(guestId: string): Promise<CartData | null> {
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
