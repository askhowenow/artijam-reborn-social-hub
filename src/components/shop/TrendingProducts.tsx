
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Product, useProducts } from '@/hooks/use-products';
import ProductImage from './ProductImage';

const TrendingProducts = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts({ trending: true, limit: 10 });

  const handleProductClick = (product: Product) => {
    navigate(`/shop/product/${product.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Carousel>
          <CarouselContent>
            {Array(3).fill(0).map((_, i) => (
              <CarouselItem key={i} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trending Products</h2>
        <div 
          className="text-sm text-artijam-purple cursor-pointer hover:underline"
          onClick={() => navigate('/shop')}
        >
          View all
        </div>
      </div>
      <Carousel className="w-full">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/3 pl-4">
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative h-48">
                  <ProductImage
                    imageUrl={product.image_url}
                    productName={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.has_ar_model && (
                    <Badge variant="secondary" className="absolute top-2 right-2 bg-artijam-purple text-white">
                      AR
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
                  <div className="flex items-baseline justify-between mt-1">
                    <div className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: product.currency || 'USD',
                      }).format(product.price)}
                    </div>
                    {product.category && (
                      <div className="text-xs text-gray-500">{product.category}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default TrendingProducts;
