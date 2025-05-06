import { supabase } from '@/integrations/supabase/client';
import { CartData, CartItem } from '@/types/cart';
import { type Product } from '@/hooks/use-products';

// Fetch cart data based on authentication status
export async function fetchCartData(isAuthenticated: boolean, guestId: string | null): Promise<CartData> {
  if (isAuthenticated) {
    // Fetch user cart
    const { data: userCart, error: userCartError } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', (await supabase.auth.getSession()).data.session?.user?.id)
      .single();

    if (userCartError && userCartError.code !== 'PGRST116') {
      throw userCartError;
    }

    let cartId: string;

    if (!userCart) {
      // Create a new cart if one doesn't exist
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({
          user_id: (await supabase.auth.getSession()).data.session?.user?.id
        })
        .select('id')
        .single();

      if (createError) throw createError;
      cartId = newCart.id;
    } else {
      cartId = userCart.id;
    }

    // Fix: Use explicit product column reference to avoid ambiguity
    const { data: cartItems, error: itemsError } = await supabase
      .from('user_cart_items')
      .select(`
        id, product_id, quantity, 
        products:products(*)
      `)
      .eq('cart_id', cartId);

    if (itemsError) throw itemsError;
    return { cartId, items: cartItems || [] };
  } else if (guestId) {
    // Fetch guest cart
    const { data: guestCart, error: guestCartError } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();

    if (guestCartError && guestCartError.code !== 'PGRST116') {
      throw guestCartError;
    }

    let cartId: string;

    if (!guestCart) {
      // Create a new guest cart if one doesn't exist
      const { data: newCart, error: createError } = await supabase
        .from('guest_carts')
        .insert({
          guest_id: guestId
        })
        .select('id')
        .single();

      if (createError) throw createError;
      cartId = newCart.id;
    } else {
      cartId = guestCart.id;
    }

    // Fix: Use explicit product column reference to avoid ambiguity
    const { data: cartItems, error: itemsError } = await supabase
      .from('guest_cart_items')
      .select(`
        id, product_id, quantity,
        products:products(*)
      `)
      .eq('cart_id', cartId);

    if (itemsError) throw itemsError;
    return { cartId, items: cartItems || [] };
  }

  return { cartId: '', items: [] };
}

// Add product to cart
export async function addToCartOperation(
  productId: string, 
  quantity: number, 
  cartId: string, 
  isAuthenticated: boolean, 
  guestId: string | null
): Promise<boolean> {
  // Increment cart_adds metric for the product
  await supabase.rpc('increment_product_metric', {
    product_id_param: productId,
    metric_name: 'cart_adds'
  });

  if (isAuthenticated) {
    // Check if product already in cart
    const { data: existingItem } = await supabase
      .from('user_cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if already in cart
      const { error } = await supabase
        .from('user_cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Add new item to cart
      const { error } = await supabase
        .from('user_cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });

      if (error) throw error;
    }
  } else if (guestId) {
    // Check if product already in guest cart
    const { data: existingItem } = await supabase
      .from('guest_cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if already in cart
      const { error } = await supabase
        .from('guest_cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Add new item to cart
      const { error } = await supabase
        .from('guest_cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });

      if (error) throw error;
    }
  }

  return true;
}

// Remove item from cart
export async function removeFromCartOperation(
  itemId: string, 
  isAuthenticated: boolean, 
  guestId: string | null
): Promise<boolean> {
  if (isAuthenticated) {
    const { error } = await supabase
      .from('user_cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  } else if (guestId) {
    const { error } = await supabase
      .from('guest_cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  return true;
}

// Update quantity of an item in the cart
export async function updateQuantityOperation(
  itemId: string, 
  quantity: number, 
  isAuthenticated: boolean, 
  guestId: string | null
): Promise<boolean> {
  if (quantity < 1) {
    throw new Error('Invalid quantity');
  }

  if (isAuthenticated) {
    const { error } = await supabase
      .from('user_cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw error;
  } else if (guestId) {
    const { error } = await supabase
      .from('guest_cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw error;
  }

  return true;
}

// Sync guest cart to user cart
export async function syncGuestCartToUserCart(guestId: string): Promise<boolean> {
  // Get guest cart items
  const { data: guestCart } = await supabase
    .from('guest_carts')
    .select('id')
    .eq('guest_id', guestId)
    .single();

  if (!guestCart) return true; // No guest cart to sync

  const { data: guestItems } = await supabase
    .from('guest_cart_items')
    .select('product_id, quantity')
    .eq('cart_id', guestCart.id);

  if (!guestItems || guestItems.length === 0) return true; // No items to sync

  // Get or create user cart
  const { data: userCart, error: userCartError } = await supabase
    .from('user_carts')
    .select('id')
    .eq('user_id', (await supabase.auth.getSession()).data.session?.user?.id)
    .single();

  if (userCartError && userCartError.code !== 'PGRST116') {
    throw userCartError;
  }

  let userCartId: string;

  if (!userCart) {
    // Create a new cart if one doesn't exist
    const { data: newCart, error: createError } = await supabase
      .from('user_carts')
      .insert({
        user_id: (await supabase.auth.getSession()).data.session?.user?.id
      })
      .select('id')
      .single();

    if (createError) throw createError;
    userCartId = newCart.id;
  } else {
    userCartId = userCart.id;
  }

  // Get existing user cart items
  const { data: existingItems } = await supabase
    .from('user_cart_items')
    .select('id, product_id, quantity')
    .eq('cart_id', userCartId);

  const existingItemsMap = new Map();
  existingItems?.forEach(item => {
    existingItemsMap.set(item.product_id, item);
  });

  // Merge guest items into user cart
  for (const guestItem of guestItems) {
    const existingItem = existingItemsMap.get(guestItem.product_id);
    
    if (existingItem) {
      // Update quantity if product already in user cart
      await supabase
        .from('user_cart_items')
        .update({ quantity: existingItem.quantity + guestItem.quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item to user cart
      await supabase
        .from('user_cart_items')
        .insert({
          cart_id: userCartId,
          product_id: guestItem.product_id,
          quantity: guestItem.quantity
        });
    }
  }

  // Clear guest cart after syncing
  await supabase
    .from('guest_cart_items')
    .delete()
    .eq('cart_id', guestCart.id);

  return true;
}

// Calculate cart total with null safety
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    // Skip calculation if products is null or undefined
    if (!item.products) {
      return total;
    }
    
    // Check if products has a price property of type number
    if (typeof item.products === 'object' && 'price' in item.products && 
        typeof item.products.price === 'number') {
      return total + (item.products.price * item.quantity);
    }
    
    return total;
  }, 0);
}

// Fetch cart items for a user
export async function fetchCartItems(userId: string): Promise<CartItem[]> {
  try {
    // First, get or create user cart
    const { data: cartData, error: cartError } = await supabase
      .from('user_carts')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (cartError && cartError.code !== 'PGRST116') {
      throw new Error(`Error fetching cart: ${cartError.message}`);
    }
    
    let cartId;
    
    // If no cart exists, create one
    if (!cartData) {
      const { data: newCart, error: createError } = await supabase
        .from('user_carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      
      if (createError) {
        throw new Error(`Error creating cart: ${createError.message}`);
      }
      
      cartId = newCart.id;
    } else {
      cartId = cartData.id;
    }
    
    // Now fetch cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('user_cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:product_id (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock_quantity,
          is_available,
          currency
        )
      `)
      .eq('cart_id', cartId);
    
    if (itemsError) {
      throw new Error(`Error fetching cart items: ${itemsError.message}`);
    }
    
    // Transform the result to match CartItem type
    const cartItems: CartItem[] = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.product
    }));
    
    return cartItems;
  } catch (error) {
    console.error('Error in fetchCartItems:', error);
    return [];
  }
}

// Fetch cart items for a guest
export async function fetchGuestCartItems(guestId: string): Promise<CartItem[]> {
  try {
    // First, get or create guest cart
    const { data: cartData, error: cartError } = await supabase
      .from('guest_carts')
      .select('id')
      .eq('guest_id', guestId)
      .single();
    
    if (cartError && cartError.code !== 'PGRST116') {
      throw new Error(`Error fetching guest cart: ${cartError.message}`);
    }
    
    let cartId;
    
    // If no cart exists, create one
    if (!cartData) {
      const { data: newCart, error: createError } = await supabase
        .from('guest_carts')
        .insert({ guest_id: guestId })
        .select('id')
        .single();
      
      if (createError) {
        throw new Error(`Error creating guest cart: ${createError.message}`);
      }
      
      cartId = newCart.id;
    } else {
      cartId = cartData.id;
    }
    
    // Now fetch cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('guest_cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:product_id (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock_quantity,
          is_available,
          currency
        )
      `)
      .eq('cart_id', cartId);
    
    if (itemsError) {
      throw new Error(`Error fetching guest cart items: ${itemsError.message}`);
    }
    
    // Transform the result to match CartItem type
    const cartItems: CartItem[] = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.product
    }));
    
    return cartItems;
  } catch (error) {
    console.error('Error in fetchGuestCartItems:', error);
    return [];
  }
}
