
import React, { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { useEvents } from '@/hooks/use-events';
import RunningBanner from '@/components/shop/RunningBanner';
import { BannerItem } from '@/types/banner';

interface ShopBannerProps {
  isAuthenticated: boolean;
}

const ShopBanner: React.FC<ShopBannerProps> = ({ isAuthenticated }) => {
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  
  // Fetch trending products for banner
  const { 
    data: trendingProducts, 
    isLoading: isTrendingLoading 
  } = useProducts({ trending: true, limit: 6 });

  // Fetch events when Events category is selected
  const { 
    events,
    isLoading: isEventsLoading,
  } = useEvents({
    filterByStatus: ['published']
  });

  // Create banner items when trending products or events load
  useEffect(() => {
    const newBannerItems: BannerItem[] = [];
    
    // Add trending products to banner items
    if (trendingProducts && trendingProducts.length > 0) {
      trendingProducts.slice(0, 3).forEach(product => {
        newBannerItems.push({
          id: product.id,
          type: 'product',
          title: product.name,
          image: product.image_url || '/placeholder.svg',
          price: product.price,
          category: product.category || 'Product',
          path: `/product/${product.id}`
        });
      });
    }
    
    // Add events to banner items
    if (events && events.length > 0) {
      events.slice(0, 2).forEach(event => {
        newBannerItems.push({
          id: event.id,
          type: 'event',
          title: event.title,
          image: event.featuredImage || '/placeholder.svg',
          category: 'Events',
          path: `/events/${event.id}`
        });
      });
    }
    
    setBannerItems(newBannerItems);
  }, [trendingProducts, events]);

  return (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Trending Now</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        {bannerItems.length > 0 ? (
          <RunningBanner 
            data={bannerItems}
            slideDuration={5000}
          />
        ) : (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-4 border-artijam-purple border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopBanner;
