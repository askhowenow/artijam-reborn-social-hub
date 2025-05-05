
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { type Product } from '@/hooks/use-products';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product | any; // Allow any to handle Supabase error types
}

interface UseCartOptions {
  syncOnLogin?: boolean;
}

export function useCart(options?: UseCartOptions) {
  const queryClient = useQueryClient();
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const syncOnLogin = options?.syncOnLogin ?? true;

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        const authenticated = !!session;
        const wasAuthenticated = isAuthenticated;
        setIsAuthenticated(authenticated);

        // If user just logged in and we have a guest cart, sync them
        if (authenticated && !wasAuthenticated && syncOnLogin && guestId) {
          syncGuestCartToUserCart.mutate();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkAuth();
  }, [syncOnLogin]);

  // Initialize guest ID from localStorage or create a new one
  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestCartId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      const newGuestId = uuidv4();
      localStorage.setItem('guestCartId', newGuestId);
      setGuestId(newGuestId);
    }
  }, []);

  // Fetch cart data based on authentication status
  const { data: cartData, isLoading, error, refetch } = useQuery({
    queryKey: ['cart', isAuthenticated, guestId],
    queryFn: async () => {
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

        // Fetch cart items with product details
        const { data: cartItems, error: itemsError } = await supabase
          .from('user_cart_items')
          .select(`
            id, product_id, quantity, 
            product:products(*)
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

        // Fetch guest cart items with product details
        const { data: cartItems, error: itemsError } = await supabase
          .from('guest_cart_items')
          .select(`
            id, product_id, quantity,
            product:products(*)
          `)
          .eq('cart_id', cartId);

        if (itemsError) throw itemsError;
        return { cartId, items: cartItems || [] };
      }

      return { cartId: '', items: [] };
    },
    enabled: isAuthenticated !== null && guestId !== null,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch cart:', error);
        toast.error('Failed to load your shopping cart.');
      }
    }
  });

  // Add product to cart
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!cartData?.cartId) {
        throw new Error('Cart not initialized');
      }

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
          .eq('cart_id', cartData.cartId)
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
              cart_id: cartData.cartId,
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
          .eq('cart_id', cartData.cartId)
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
              cart_id: cartData.cartId,
              product_id: productId,
              quantity
            });

          if (error) throw error;
        }
      }

      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success('Product added to cart');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
      onError: (error: Error) => {
        console.error('Failed to add product to cart:', error);
        toast.error('Failed to add product to cart. Please try again.');
      }
    }
  });

  // Remove item from cart
  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      if (!cartData?.cartId) {
        throw new Error('Cart not initialized');
      }

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
    },
    meta: {
      onSuccess: () => {
        toast.success('Product removed from cart');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
      onError: (error: Error) => {
        console.error('Failed to remove product from cart:', error);
        toast.error('Failed to remove product from cart. Please try again.');
      }
    }
  });

  // Update quantity of an item in the cart
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!cartData?.cartId || quantity < 1) {
        throw new Error('Invalid operation');
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
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
      onError: (error: Error) => {
        console.error('Failed to update cart:', error);
        toast.error('Failed to update cart. Please try again.');
      }
    }
  });

  // Sync guest cart to user cart on login
  const syncGuestCartToUserCart = useMutation({
    mutationFn: async () => {
      if (!guestId || !isAuthenticated) {
        throw new Error('Cannot sync cart: missing guest ID or not authenticated');
      }

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

      // Prepare operations: merge guest items into user cart
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
    },
    meta: {
      onSuccess: () => {
        toast.success('Your cart has been synced to your account');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
      onError: (error: Error) => {
        console.error('Failed to sync cart:', error);
        toast.error('Failed to sync your cart. Please try again.');
      }
    }
  });

  // Calculate cart totals
  const cartCount = cartData?.items?.reduce((count, item) => count + item.quantity, 0) || 0;
  const cartTotal = cartData?.items?.reduce((total, item) => {
    // Check if product is defined and has a price property before using it
    if (item.product && item.product.price !== undefined && 
        item.product.price !== null && typeof item.product.price === 'number') {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0) || 0;

  return {
    cart: cartData?.items || [],
    cartId: cartData?.cartId,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    syncGuestCartToUserCart,
    cartCount,
    cartTotal,
    isAuthenticated,
    refetch
  };
}
