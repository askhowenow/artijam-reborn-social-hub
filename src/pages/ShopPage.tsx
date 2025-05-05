
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useProducts } from '@/hooks/use-products';
import ProductCard from '@/components/shop/ProductCard';
import CartDrawer from '@/components/shop/CartDrawer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';

const categoryFilters = [
  'All',
  'Art',
  'Crafts',
  'Digital',
  'Clothing',
  'Accessories',
  'Home Decor'
];

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cartCount, isAuthenticated } = useCart();
  
  // Fetch trending products for carousel
  const { 
    data: trendingProducts, 
    isLoading: isTrendingLoading 
  } = useProducts({ trending: true, limit: 10 });

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
          
          {isTrendingLoading ? (
            <Card className="w-full h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
            </Card>
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {trendingProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-white" />
              <CarouselNext className="right-2 bg-white" />
            </Carousel>
          ) : (
            <Card className="w-full p-8 text-center">
              <p className="text-gray-500">No trending products yet</p>
            </Card>
          )}
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {categoryFilters.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? "default" : "outline"}
                className="px-3 py-1 cursor-pointer bg-artijam-purple"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

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

          {isProductsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="h-64 animate-pulse">
                  <div className="bg-gray-200 h-40" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500">Failed to load products. Please try again later.</p>
            </Card>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                {selectedCategory 
                  ? `No products found in ${selectedCategory} category`
                  : 'No products available'}
              </p>
            </Card>
          )}
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {['Art', 'Digital', 'Clothing'].map((category) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/10">
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-500 mb-4">
                  Discover unique {category.toLowerCase()} from independent creators
                </p>
                <Button 
                  variant="link" 
                  className="flex items-center p-0 text-artijam-purple"
                  onClick={() => {
                    setSelectedCategory(category);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Browse {category}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Become a Vendor CTA */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/5">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Become a Vendor</h3>
                <p className="text-gray-700 mb-4">
                  Start selling your creations on Artijam's marketplace and reach our creative community
                </p>
              </div>
              <Button 
                className="bg-artijam-purple hover:bg-artijam-purple/90"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/vendor/profile');
                  }
                }}
              >
                {isAuthenticated ? 'Start Selling' : 'Sign in to Start Selling'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
