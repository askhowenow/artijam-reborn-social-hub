
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/shop/ProductCard';
import { type Product } from '@/hooks/use-products';

interface ProductGridProps {
  products: Product[] | null;
  isLoading: boolean;
  error: Error | null;
  selectedCategory: string | null;
}

const ProductGrid = ({ products, isLoading, error, selectedCategory }: ProductGridProps) => {
  console.log(`ProductGrid rendering with ${products?.length || 0} products, isLoading: ${isLoading}, error: ${error?.message || 'none'}`);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="h-64 animate-pulse">
            <div className="bg-gray-200 aspect-square" />
            <CardContent className="p-2 sm:p-4">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error in ProductGrid:", error);
    return (
      <Card className="p-4 sm:p-8 text-center">
        <p className="text-red-500">Failed to load products. Please try again later.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="p-4 sm:p-8 text-center">
        <p className="text-gray-500">
          {selectedCategory 
            ? `No products found in ${selectedCategory} category`
            : 'No products available'}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
