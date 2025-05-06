
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { type Product } from '@/hooks/use-products';

// Types moved to a separate file for better organization
import { 
  CartItem, 
  UseCartOptions, 
  UseCartResult 
} from '@/types/cart';

// Helper utilities for cart operations
import { 
  fetchCartData, 
  syncGuestCartToUserCart as syncCart,
  addToCartOperation,
  removeFromCartOperation,
  updateQuantityOperation,
  calculateCartTotal
} from '@/utils/cartUtils';

export function useCart(options?: UseCartOptions): UseCartResult {
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
    queryFn: () => fetchCartData(isAuthenticated, guestId),
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
      return addToCartOperation(productId, quantity, cartData.cartId, isAuthenticated, guestId);
    },
    onSuccess: () => {
      toast.success('Product added to cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('Failed to add product to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    }
  });

  // Remove item from cart
  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      return removeFromCartOperation(itemId, isAuthenticated, guestId);
    },
    onSuccess: () => {
      toast.success('Product removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('Failed to remove product from cart:', error);
      toast.error('Failed to remove product from cart. Please try again.');
    }
  });

  // Update quantity of an item in the cart
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) {
        throw new Error('Invalid quantity');
      }
      return updateQuantityOperation(itemId, quantity, isAuthenticated, guestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart. Please try again.');
    }
  });

  // Sync guest cart to user cart on login
  const syncGuestCartToUserCart = useMutation({
    mutationFn: async () => {
      if (!guestId) {
        throw new Error('Cannot sync cart: missing guest ID');
      }
      return syncCart(guestId);
    },
    onSuccess: () => {
      toast.success('Your cart has been synced to your account');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('Failed to sync cart:', error);
      toast.error('Failed to sync your cart. Please try again.');
    }
  });

  // Calculate cart totals with null safety
  const cartItems = cartData?.items || [];
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = calculateCartTotal(cartItems);

  return {
    cart: cartItems,
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
