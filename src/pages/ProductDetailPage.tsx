
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetails } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Eye, 
  ShoppingBag, 
  Heart, 
  Share2, 
  CheckCircle,
  ArrowLeft,
  Loader2
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

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = React.useState(1);
  const { addToCart, cartCount } = useCart();
  
  const { 
    data: product, 
    isLoading, 
    error 
  } = useProductDetails(productId);
  
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
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
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
  
  return (
    <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6">
      {/* Mobile Header with Back Button and Cart */}
      <div className="flex justify-between items-center md:hidden mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/shop')}
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
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/shop?category=${product.category}`}>
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
        {/* Product Images */}
        <div>
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
          
          {/* Thumbnails */}
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
            ${product.price.toFixed(2)}
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
              
              <Button 
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
            
            <div className="flex justify-center gap-4 mt-2">
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/vendor/shop/${product.vendor_id}`)}
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
  );
};

export default ProductDetailPage;
