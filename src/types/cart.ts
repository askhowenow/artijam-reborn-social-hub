
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean | null;
  currency: string;
  purchase_price?: number | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

// Adding the missing interfaces
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
  addToCart: any;
  removeFromCart: any;
  updateQuantity: any;
  syncGuestCartToUserCart: any;
  cartCount: number;
  cartTotal: number;
  isAuthenticated: boolean;
  refetch: () => void;
}
