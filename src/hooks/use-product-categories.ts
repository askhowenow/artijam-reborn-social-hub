
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      // Fetch all unique, non-null categories from products table
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .order('category');
      
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          data
            .map(item => item.category)
            .filter(Boolean) // Remove any null or undefined values
        )
      ).sort();
      
      return uniqueCategories;
    }
  });
}
