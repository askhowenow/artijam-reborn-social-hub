
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetails } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Eye, 
  ShoppingBag, 
  Heart, 
  Share2, 
  CheckCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CubeIcon
} from 'lucide-react';
import CartDrawer from '@/components/shop/CartDrawer';
import { Separator } from '@/components/ui/separator';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Product3DViewer from '@/components/shop/Product3DViewer';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = React.useState(1);
  const { addToCart, cartCount, isAuthenticated } = useCart();
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image');
  
  const { 
    data: product, 
    isLoading, 
    error 
  } = useProductDetails(productId);
  
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, [productId]);
  
  // Check AR support
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if AR is supported on this device
    const checkARSupport = () => {
      // iOS AR Quick Look support check
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isIOSWithAR = isIOS && 'getStartARSession' in document.createElement('a');
      
      // Android AR support check
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isARSupportedOnAndroid = isAndroid && 'xr' in navigator && 'isSessionSupported' in (navigator as any).xr;
      
      return isIOSWithAR || isARSupportedOnAndroid;
    };
    
    setArSupported(checkARSupport());
  }, []);
  
  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate({ 
        productId: product.id, 
        quantity 
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-artijam-purple" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for doesn't exist or has been removed</p>
          <Button onClick={() => navigate('/')}>Back to Shop</Button>
        </Card>
      </div>
    );
  }
  
  // Create multiple images for the carousel (in a real app, the product would have multiple images)
  const images = [
    product.image_url || '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg'
  ];
  
  // Determine if the product has a 3D model
  const has3DModel = product.has_ar_model && product.model_url;
  
  return (
    <>
      <Helmet>
        <title>{product.name} | Artijam</title>
        <meta name="description" content={product.description || `${product.name} - Shop unique items on Artijam.`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description || `${product.name} - Shop unique items on Artijam.`} />
        <meta property="og:image" content={product.image_url || '/placeholder.svg'} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content={product.currency || "USD"} />
      </Helmet>
      
      <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6">
        {/* Mobile Header with Back Button and Cart */}
        <div className="flex justify-between items-center md:hidden mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CartDrawer />
        </div>
        
        {/* Breadcrumbs - Desktop Only */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {product.category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/?category=${product.category}`}>
                      {product.category}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink href={`/shop/product/${product.id}`} className="truncate max-w-[200px]">
                  {product.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="hidden md:block">
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Images / 3D Model */}
          <div>
            {has3DModel && (
              <div className="mb-4 flex justify-center">
                <Tabs
                  defaultValue="image"
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as 'image' | '3d')}
                  className="w-full"
                >
                  <div className="flex justify-center mb-2">
                    <TabsList>
                      <TabsTrigger value="image" className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span>Images</span>
                      </TabsTrigger>
                      <TabsTrigger value="3d" className="flex items-center gap-1">
                        <CubeIcon className="h-4 w-4" />
                        <span>3D View</span>
                        {arSupported && (
                          <Badge variant="secondary" className="ml-1">AR</Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="image" className="mt-0">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-square w-full rounded-md overflow-hidden bg-gray-100">
                              <img 
                                src={image} 
                                alt={`${product.name} - Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                    
                    <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        <div 
                          key={index}
                          className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-artijam-purple"
                        >
                          <img 
                            src={image} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="3d" className="mt-0">
                    <div className="aspect-square w-full rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      <Product3DViewer 
                        modelUrl={product.model_url || ''}
                        modelFormat={product.model_format}
                        alt={product.name}
                        className="w-full h-full min-h-[300px] md:min-h-[400px]"
                      />
                    </div>
                    
                    {arSupported && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          View this product in your space using augmented reality
                        </p>
                        <div className="text-xs text-gray-500">
                          Look for the AR button in the 3D viewer
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {/* Standard image carousel if no 3D model */}
            {!has3DModel && (
              <>
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square w-full rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={image} 
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
                
                <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <div 
                      key={index}
                      className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-artijam-purple"
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-normal">
                {product.category || 'Uncategorized'}
              </Badge>
              
              {product.metrics && (
                <div className="flex items-center text-xs text-gray-500">
                  <Eye className="w-3 h-3 mr-1" />
                  {product.metrics.views || 0} views
                </div>
              )}
              
              {has3DModel && (
                <Badge className="bg-artijam-purple text-xs">
                  <CubeIcon className="h-3 w-3 mr-1" />
                  {arSupported ? 'AR Available' : '3D View'}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">By</span>
              <div className="flex items-center">
                <span className="font-medium">{product.vendor?.business_name}</span>
                {product.vendor?.is_verified && (
                  <CheckCircle className="ml-1 h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>
            
            <div className="text-2xl font-bold text-artijam-purple mb-4">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">
                {product.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Availability</h3>
              <div className="flex items-center">
                {product.is_available && product.stock_quantity && product.stock_quantity > 0 ? (
                  <Badge className="bg-green-500">In Stock ({product.stock_quantity} available)</Badge>
                ) : (
                  <Badge className="bg-red-500">Out of Stock</Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <label className="text-sm text-gray-500 mb-1 block">Quantity</label>
                  <div className="flex">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <div className="flex items-center justify-center w-12 border-y border-input">
                      {quantity}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.stock_quantity !== null && quantity >= product.stock_quantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-artijam-purple hover:bg-artijam-purple/90"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.is_available || product.stock_quantity === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
                {isAuthenticated ? (
                  <Button 
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => navigate('/login')}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Sign in for more options
                  </Button>
                )}
              </div>
              
              {has3DModel && arSupported && viewMode === 'image' && (
                <Button 
                  variant="secondary"
                  onClick={() => setViewMode('3d')}
                  className="mt-2"
                >
                  <CubeIcon className="mr-2 h-5 w-5" />
                  View in 3D/AR
                </Button>
              )}
              
              <div className="flex justify-center gap-4 mt-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/vendor/shop/${product.vendor_id}`);
                    } else {
                      navigate(`/?vendor=${product.vendor_id}`);
                    }
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Shop
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional content like reviews, related products would go here */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
            <p className="text-gray-500 text-center py-8">
              This product doesn't have any reviews yet. Be the first to review!
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductDetailPage;
