
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@/hooks/use-cart';
import { Bed, Plane, Utensils, Ticket, Calendar } from 'lucide-react';

// Import components
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import FeaturedCategories from '@/components/shop/FeaturedCategories';
import VendorCTA from '@/components/shop/VendorCTA';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopBanner from '@/components/shop/ShopBanner';
import ShopEvents from '@/components/shop/ShopEvents';
import { useProducts } from '@/hooks/use-products';

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

// Map categories to their icons
const categoryIcons = {
  'Accommodations': <Bed className="h-4 w-4 mr-2" />,
  'Travel': <Plane className="h-4 w-4 mr-2" />,
  'Food': <Utensils className="h-4 w-4 mr-2" />,
  'Attractions': <Ticket className="h-4 w-4 mr-2" />,
  'Events': <Calendar className="h-4 w-4 mr-2" />
};

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isAuthenticated } = useCart();
  
  // Fetch products based on selected category
  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError
  } = useProducts({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    limit: 8
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

  // Check if Events category is selected
  const isEventCategory = selectedCategory === 'Events';

  return (
    <>
      <Helmet>
        <title>Shop - Discover Creative Products & Events</title>
        <meta name="description" content="Shop unique items and attend events created by the Artijam creative community." />
      </Helmet>

      <div className="container max-w-7xl mx-auto py-3 sm:py-4 px-2 sm:px-6">
        {/* Shop Header with Cart */}
        <ShopHeader isAuthenticated={isAuthenticated} />

        {/* Banner Section with Trending Products/Events */}
        <ShopBanner isAuthenticated={isAuthenticated} />

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
        <ShopEvents isSelected={isEventCategory} />

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
