
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '@/hooks/use-products';
import { useEvents } from '@/hooks/use-events';
import CartDrawer from '@/components/shop/CartDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';

// Import the new components
import TrendingProducts from '@/components/shop/TrendingProducts';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import FeaturedCategories from '@/components/shop/FeaturedCategories';
import VendorCTA from '@/components/shop/VendorCTA';
import EventCard from '@/components/events/EventCard';

const categoryFilters = [
  'All',
  'Events',
  'Art',
  'Crafts',
  'Digital',
  'Clothing',
  'Accessories',
  'Home Decor'
];

const featuredCategories = ['Events', 'Art', 'Digital', 'Clothing'];

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cartCount, isAuthenticated } = useCart();
  
  // Fetch products with optional category filter
  const { 
    data: products, 
    isLoading: isProductsLoading,
    error
  } = useProducts({ 
    category: selectedCategory === 'All' || selectedCategory === 'Events' ? null : selectedCategory, 
    limit: 24
  });

  // Fetch published events
  const { 
    events,
    isLoading: isEventsLoading,
  } = useEvents({
    filterByStatus: ['published']
  });

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

  return (
    <>
      <Helmet>
        <title>Shop - Discover Creative Products & Events</title>
        <meta name="description" content="Shop unique items and attend events created by the Artijam creative community." />
        <meta property="og:title" content="Shop - Creative Marketplace & Events" />
        <meta property="og:description" content="Discover and shop unique creative items from independent artists and makers. Attend exclusive events from our community." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop - Creative Marketplace & Events" />
        <meta name="twitter:description" content="Discover and shop unique creative items from independent artists and makers. Attend exclusive events from our community." />
      </Helmet>

      <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6">
        {/* Mobile header with cart - Only shown in AppLayout */}
        {isAuthenticated && (
          <div className="flex justify-between items-center md:hidden mb-4">
            <h1 className="text-2xl font-bold">Shop</h1>
            <CartDrawer />
          </div>
        )}

        {/* Hero Section with Trending Products Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending Now</h2>
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
          
          <TrendingProducts />
        </div>

        {/* Category Filters */}
        <CategoryFilter 
          categories={categoryFilters}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Events Grid or Products Grid based on selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEventCategory ? 'Upcoming Events' : selectedCategory || 'All Products'}
            </h2>
            
            {selectedCategory && (
              <Button 
                variant="link" 
                className="text-artijam-purple"
                onClick={() => setSelectedCategory(null)}
              >
                View All
              </Button>
            )}
          </div>

          {isEventCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isEventsLoading ? (
                <div className="col-span-full flex justify-center py-10">
                  <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-xl font-medium">No upcoming events found</h3>
                  <p className="text-gray-500 mt-1">Check back later for new events</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="cursor-pointer">
                    {/* This is a placeholder for the EventCard component */}
                    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {event.featuredImage ? (
                          <img src={event.featuredImage} alt={event.title} className="w-full h-full object-cover" />
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
          ) : (
            <ProductGrid 
              products={products}
              isLoading={isProductsLoading}
              error={error}
              selectedCategory={selectedCategory}
            />
          )}
        </div>

        {/* Featured Categories */}
        <FeaturedCategories 
          categories={featuredCategories}
          onCategorySelect={handleFeaturedCategorySelect}
        />

        {/* Become a Vendor CTA */}
        <VendorCTA isAuthenticated={isAuthenticated} />
      </div>
    </>
  );
};

export default ShopPage;
