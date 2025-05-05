
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean | null;
  vendor_id: string;
  created_at: string | null;
  updated_at: string | null;
  vendor?: {
    business_name: string;
    is_verified: boolean | null;
  };
  metrics?: {
    views: number;
    cart_adds: number;
    purchases: number;
  };
};

export function useProducts(options?: { trending?: boolean; limit?: number; category?: string }) {
  const trending = options?.trending ?? false;
  const limit = options?.limit ?? 20;
  const category = options?.category;

  const query = useQuery({
    queryKey: ['products', trending, limit, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          vendor:vendor_profiles(business_name, is_verified),
          metrics:product_metrics(views, cart_adds, purchases)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (trending) {
        // Join with metrics and order by engagement score
        query = query
          .order('metrics(views)', { ascending: false })
          .order('metrics(cart_adds)', { ascending: false })
          .order('metrics(purchases)', { ascending: false });
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Product[];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products. Please try again later.');
      }
    }
  });

  return query;
}

export function useProductDetails(productId?: string) {
  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendor_profiles(business_name, is_verified),
          metrics:product_metrics(views, cart_adds, purchases)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      // Increment view count
      await supabase.rpc('increment_product_metric', {
        product_id_param: productId,
        metric_name: 'views'
      });

      return data as Product;
    },
    enabled: !!productId,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch product details:', error);
        toast.error('Failed to load product details. Please try again later.');
      }
    }
  });

  return query;
}
