
import React from 'react';
import { useProducts } from '@/hooks/use-products';
import ProductCard from '@/components/shop/ProductCard';
import { Card } from '@/components/ui/card';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Loader2 } from 'lucide-react';

const TrendingProducts = () => {
  // Fetch trending products for carousel
  const { 
    data: trendingProducts, 
    isLoading: isTrendingLoading 
  } = useProducts({ trending: true, limit: 10 });

  if (isTrendingLoading) {
    return (
      <Card className="w-full h-48 xs:h-64 flex items-center justify-center">
        <Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin text-artijam-purple" />
      </Card>
    );
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return (
      <Card className="w-full p-4 xs:p-8 text-center">
        <p className="text-gray-500 text-sm xs:text-base">No trending products yet</p>
      </Card>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {trendingProducts.map((product) => (
          <CarouselItem key={product.id} className="basis-full xs:basis-1/2 sm:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ProductCard product={product} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 sm:left-2 bg-white/80 backdrop-blur-sm h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10" />
      <CarouselNext className="right-0 sm:right-2 bg-white/80 backdrop-blur-sm h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10" />
    </Carousel>
  );
};

export default TrendingProducts;
