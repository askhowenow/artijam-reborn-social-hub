
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  // Add the new fields for 3D models
  model_url: string | null;
  model_format: string | null;
  has_ar_model: boolean | null;
  currency: string | null;
};

export function useProducts(options?: { trending?: boolean; limit?: number; category?: string }) {
  const trending = options?.trending ?? false;
  const limit = options?.limit ?? 20;
  const category = options?.category;

  const query = useQuery({
    queryKey: ['products', trending, limit, category],
    queryFn: async () => {
      console.log("Fetching products with options:", options);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          vendor:vendor_profiles(business_name, is_verified),
          metrics:product_metrics!product_metrics_product_id_fkey(views, cart_adds, purchases)
        `);

      // Only filter by is_available if specifically requested
      query = query.eq('is_available', true);
      
      if (category) {
        query = query.eq('category', category);
        console.log(`Filtering by category: ${category}`);
      }

      if (trending) {
        // Order by creation date as a fallback if metrics cannot be used for ordering
        query = query.order('created_at', { ascending: false });
        console.log("Ordering by creation date (trending fallback)");
      } else {
        // Default ordering by creation date
        query = query.order('created_at', { ascending: false });
      }

      query = query.limit(limit);
      console.log(`Limiting results to ${limit} products`);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} products from database`);
      
      // Transform the data to match our Product type
      const transformedData = data.map(item => {
        return {
          ...item,
          metrics: item.metrics && item.metrics.length > 0 
            ? item.metrics[0] 
            : { views: 0, cart_adds: 0, purchases: 0 }
        };
      }) as Product[];
      
      return transformedData;
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
          metrics:product_metrics!product_metrics_product_id_fkey(views, cart_adds, purchases)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      // Transform the metrics array to a single object
      const product = {
        ...data,
        metrics: data.metrics && data.metrics.length > 0 
          ? data.metrics[0] 
          : { views: 0, cart_adds: 0, purchases: 0 }
      } as Product;

      // Increment view count - wrapped in try/catch to avoid breaking the page if it fails
      try {
        await supabase.rpc('increment_product_metric', {
          product_id_param: productId,
          metric_name: 'views'
        });
      } catch (metricError) {
        console.error('Failed to increment product view metric:', metricError);
      }

      return product;
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
