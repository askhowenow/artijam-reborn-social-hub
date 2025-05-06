
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ImageIcon, 
  ShoppingCart, 
  AlertCircle, 
  QrCode,
  Share2,
  ArrowLeft 
} from "lucide-react";
import { formatPrice } from "@/utils/string-utils";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogTitle 
} from "@/components/ui/dialog";
import VendorQRCodeGenerator from "@/components/vendor/VendorQRCodeGenerator";

interface Vendor {
  id: string;
  business_name: string;
  business_description: string | null;
  store_slug: string;
  banner_image_url: string | null;
  is_verified: boolean | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean;
}

const StorefrontPage = () => {
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(productId || null);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState<boolean>(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  const { addToCart, isAuthenticated } = useCart();
  
  useEffect(() => {
    // Update highlighted product when productId param changes
    setHighlightedProductId(productId || null);
    
    // Scroll to highlighted product if it exists
    if (productId) {
      const element = document.getElementById(`product-${productId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [productId]);
  
  // Fetch vendor profile by slug
  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['storefront', storeSlug],
    queryFn: async () => {
      if (!storeSlug) throw new Error("Store slug is required");
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select(`
          id, 
          business_name, 
          business_description,
          store_slug,
          banner_image_url,
          is_verified
        `)
        .eq('store_slug', storeSlug)
        .single();
        
      if (error) throw error;
      return data as Vendor;
    },
  });
  
  // Fetch products for this vendor
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['storefrontProducts', vendor?.id, selectedCategory],
    queryFn: async () => {
      if (!vendor?.id) return [];
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          currency,
          image_url,
          category,
          stock_quantity,
          is_available
        `)
        .eq('vendor_id', vendor.id)
        .eq('is_available', true);
        
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;

      // If we have a productId param, update metrics for this specific view
      if (productId && data.some(p => p.id === productId)) {
        await supabase.rpc('increment_product_metric', {
          product_id_param: productId,
          metric_name: 'views'
        });
      }
      
      return data as Product[];
    },
    enabled: !!vendor?.id,
  });
  
  // Get unique categories for filter
  const categories = React.useMemo(() => {
    if (!products) return [];
    
    const categorySet = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    return Array.from(categorySet);
  }, [products]);
  
  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: 1
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  // Handle QR code generation
  const handleQRCodeGenerate = (product: Product) => {
    setSelectedQrProduct(product);
    setQrCodeModalOpen(true);
  };

  // Get highlighted product
  const highlightedProduct = products?.find(p => p.id === highlightedProductId) || null;
  
  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }
  
  if (vendorError || !vendor) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
          <p className="text-gray-500">
            The store you're looking for doesn't exist or has been removed.
          </p>
          <Button
            className="mt-6 bg-artijam-purple hover:bg-artijam-purple/90"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Banner */}
      <div className="relative bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/5 h-48 md:h-64">
        {vendor.banner_image_url ? (
          <img
            src={vendor.banner_image_url}
            alt={vendor.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Store Info */}
      <div className="container max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Back button when viewing a specific product */}
        {highlightedProductId && (
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => {
              navigate(`/store/@${storeSlug}`);
              setHighlightedProductId(null);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to all products
          </Button>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
                {vendor.is_verified && (
                  <Badge className="ml-2 bg-blue-500">Verified</Badge>
                )}
              </div>
              {vendor.business_description && (
                <p className="text-gray-600 mt-2 max-w-2xl">
                  {vendor.business_description}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedQrProduct(null);
                  setQrCodeModalOpen(true);
                }}
              >
                <QrCode className="h-4 w-4" />
                Store QR Code
              </Button>
            </div>
          </div>
        </div>
        
        {highlightedProduct ? (
          // Display highlighted product in detail
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8" id={`product-${highlightedProduct.id}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-100 rounded-lg overflow-hidden h-[300px]">
                {highlightedProduct.image_url ? (
                  <img 
                    src={highlightedProduct.image_url} 
                    alt={highlightedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-20 w-20 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{highlightedProduct.name}</h2>
                
                <p className="text-xl font-bold text-artijam-purple my-4">
                  {formatPrice(highlightedProduct.price, highlightedProduct.currency)}
                </p>
                
                {highlightedProduct.category && (
                  <Badge className="mb-4">
                    {highlightedProduct.category}
                  </Badge>
                )}
                
                <p className="text-gray-600 mb-6">
                  {highlightedProduct.description || "No description provided."}
                </p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Availability:</p>
                  <Badge className={highlightedProduct.stock_quantity && highlightedProduct.stock_quantity > 0 ? "bg-green-500" : "bg-red-500"}>
                    {highlightedProduct.stock_quantity && highlightedProduct.stock_quantity > 0 ? 
                      `In Stock (${highlightedProduct.stock_quantity})` : 
                      "Out of Stock"}
                  </Badge>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  <Button 
                    className="bg-artijam-purple hover:bg-artijam-purple/90"
                    disabled={!highlightedProduct.stock_quantity || highlightedProduct.stock_quantity <= 0}
                    onClick={() => handleAddToCart(highlightedProduct)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleQRCodeGenerate(highlightedProduct)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Product QR Code
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: highlightedProduct.name,
                          text: highlightedProduct.description || `Check out ${highlightedProduct.name}`,
                          url: window.location.href
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard");
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex space-x-2 min-w-max">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="px-3 py-1 cursor-pointer bg-artijam-purple"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Products
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="px-3 py-1 cursor-pointer bg-artijam-purple"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    id={`product-${product.id}`}
                    className="overflow-hidden group"
                  >
                    <div 
                      className="relative h-48 bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/store/@${storeSlug}/product/${product.id}`)}
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 
                        className="font-medium text-lg truncate cursor-pointer hover:text-artijam-purple"
                        onClick={() => navigate(`/store/@${storeSlug}/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-semibold text-artijam-purple">
                          {formatPrice(product.price, product.currency)}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleQRCodeGenerate(product)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-500">
                  No products available 
                  {selectedCategory ? ` in ${selectedCategory}` : ''}
                </h3>
                {selectedCategory && (
                  <Button
                    variant="link"
                    className="mt-2 text-artijam-purple"
                    onClick={() => setSelectedCategory(null)}
                  >
                    View all products
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeModalOpen} onOpenChange={setQrCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Store QR Code</DialogTitle>
          <DialogDescription>
            {selectedQrProduct 
              ? `Share this QR code to give customers direct access to ${selectedQrProduct.name}.`
              : `Share this QR code to give customers access to the ${vendor.business_name} store.`}
          </DialogDescription>
          <VendorQRCodeGenerator
            storeSlug={vendor.store_slug}
            productId={selectedQrProduct?.id}
            businessName={vendor.business_name}
            productName={selectedQrProduct?.name}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorefrontPage;
