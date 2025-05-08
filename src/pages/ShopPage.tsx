
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '@/hooks/use-products';
import { useEvents } from '@/hooks/use-events';
import CartDrawer from '@/components/shop/CartDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Bed, Plane, Utensils, Ticket } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';
import RunningBanner from '@/components/shop/RunningBanner';
import { BannerItem } from '@/types/banner';

// Import the components
import CategoryFilter from '@/components/shop/CategoryFilter';
import EventCard from '@/components/events/EventCard';
import FeaturedCategories from '@/components/shop/FeaturedCategories';
import VendorCTA from '@/components/shop/VendorCTA';
import ProductGrid from '@/components/shop/ProductGrid';

const categoryFilters = [
  'All',
  'Events',
  'Art',
  'Crafts',
  'Digital',
  'Clothing',
  'Accessories',
  'Home Decor',
  'Accommodations',
  'Travel',
  'Food',
  'Attractions'
];

const featuredCategories = ['Events', 'Art', 'Accommodations', 'Travel', 'Food', 'Attractions'];

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cartCount, isAuthenticated } = useCart();
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  
  // Fetch events when Events category is selected
  const { 
    events,
    isLoading: isEventsLoading,
  } = useEvents({
    filterByStatus: ['published']
  });

  // Fetch trending products for banner
  const { 
    data: trendingProducts, 
    isLoading: isTrendingLoading 
  } = useProducts({ trending: true, limit: 6 });

  // Fetch products based on selected category
  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError
  } = useProducts({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    limit: 8
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
  };

  const handleFeaturedCategorySelect = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  // Display events or products based on selected category
  const isEventCategory = selectedCategory === 'Events';

  // Map categories to their icons
  const categoryIcons = {
    'Accommodations': <Bed className="h-4 w-4 mr-2" />,
    'Travel': <Plane className="h-4 w-4 mr-2" />,
    'Food': <Utensils className="h-4 w-4 mr-2" />,
    'Attractions': <Ticket className="h-4 w-4 mr-2" />,
    'Events': <Calendar className="h-4 w-4 mr-2" />
  };

  return (
    <>
      <Helmet>
        <title>Shop - Discover Creative Products & Events</title>
        <meta name="description" content="Shop unique items and attend events created by the Artijam creative community." />
      </Helmet>

      <div className="container max-w-7xl mx-auto py-3 sm:py-4 px-2 sm:px-6">
        {/* Mobile header with cart - Only shown on mobile */}
        <div className="flex justify-between items-center md:hidden mb-3">
          <h1 className="text-xl font-bold">Shop</h1>
          {isAuthenticated && <CartDrawer />}
        </div>

        {/* Running Banner Section with Trending Products/Events */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Trending Now</h2>
            {isAuthenticated && (
              <div className="hidden md:flex">
                <CartDrawer>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <Badge className="ml-1 bg-artijam-purple">{cartCount}</Badge>
                    )}
                  </Button>
                </CartDrawer>
              </div>
            )}
          </div>
          
          {/* Replace TrendingProducts with RunningBanner */}
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

        {/* Category Filters */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3">Browse Categories</h2>
          <CategoryFilter 
            categories={categoryFilters}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categoryIcons={categoryIcons}
          />
        </div>

        {/* Products Grid (shown when not Events category) */}
        {!isEventCategory && (
          <div className="mb-8">
            <ProductGrid 
              products={products} 
              isLoading={isProductsLoading} 
              error={productsError} 
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {/* Events Grid (only shown when Events category is selected) */}
        {isEventCategory && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Upcoming Events</h2>
              <Button 
                variant="link" 
                className="text-artijam-purple"
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isEventsLoading ? (
                <div className="col-span-full flex justify-center py-10">
                  <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg sm:text-xl font-medium">No upcoming events found</h3>
                  <p className="text-gray-500 mt-1">Check back later for new events</p>
                </div>
              ) : (
                events.slice(0, 6).map((event) => (
                  <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="cursor-pointer">
                    {/* This is a placeholder for the EventCard component */}
                    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {event.featuredImage ? (
                          <img src={event.featuredImage} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Calendar className="h-16 w-16 text-white" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString()}</p>
                        <p className="text-sm truncate mt-2">{event.location.city}, {event.location.state}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Featured Categories */}
        <div className="mb-8">
          <FeaturedCategories 
            categories={featuredCategories}
            onCategorySelect={handleFeaturedCategorySelect}
            categoryIcons={categoryIcons}
          />
        </div>

        {/* Become a Vendor CTA */}
        <VendorCTA isAuthenticated={isAuthenticated} />
      </div>
    </>
  );
};

export default ShopPage;
