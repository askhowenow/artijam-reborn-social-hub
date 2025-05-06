
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '@/hooks/use-products';
import CartDrawer from '@/components/shop/CartDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';

// Import the new components
import TrendingProducts from '@/components/shop/TrendingProducts';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import FeaturedCategories from '@/components/shop/FeaturedCategories';
import VendorCTA from '@/components/shop/VendorCTA';

const categoryFilters = [
  'All',
  'Art',
  'Crafts',
  'Digital',
  'Clothing',
  'Accessories',
  'Home Decor'
];

const featuredCategories = ['Art', 'Digital', 'Clothing'];

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
    category: selectedCategory === 'All' ? null : selectedCategory, 
    limit: 24
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

  return (
    <>
      <Helmet>
        <title>TikTokShop - Discover Creative Products</title>
        <meta name="description" content="Shop unique items created by the Artijam creative community." />
        <meta property="og:title" content="TikTokShop - Creative Marketplace" />
        <meta property="og:description" content="Discover and shop unique creative items from independent artists and makers." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TikTokShop - Creative Marketplace" />
        <meta name="twitter:description" content="Discover and shop unique creative items from independent artists and makers." />
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

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {selectedCategory || 'All Products'}
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

          <ProductGrid 
            products={products}
            isLoading={isProductsLoading}
            error={error}
            selectedCategory={selectedCategory}
          />
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
