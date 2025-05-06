
import { type Product } from '@/hooks/use-products';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products?: Product | null;
}

export interface CartData {
  cartId: string;
  items: CartItem[];
}

export interface UseCartOptions {
  syncOnLogin?: boolean;
}

export interface UseCartResult {
  cart: CartItem[];
  cartId?: string;
  isLoading: boolean;
  error: Error | null;
  addToCart: any; // Using any here since the mutation types are complex
  removeFromCart: any;
  updateQuantity: any;
  syncGuestCartToUserCart: any;
  cartCount: number;
  cartTotal: number;
  isAuthenticated: boolean;
  refetch: () => void;
}
