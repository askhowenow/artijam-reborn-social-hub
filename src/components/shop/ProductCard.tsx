
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, CheckCircle } from "lucide-react";
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';
import { type Product } from '@/hooks/use-products';
import DeleteProductDialog from '@/components/vendor/DeleteProductDialog';

interface ProductCardProps {
  product: Product;
  wide?: boolean;
  onDelete?: (productId: string) => void;
  isVendorView?: boolean;
}

const ProductCard = ({ product, wide = false, onDelete, isVendorView = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleViewProduct = () => {
    navigate(`/shop/product/${product.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };
  
  const placeholderImage = "/placeholder.svg";
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group ${
        wide ? 'flex flex-row h-40' : 'h-full'
      }`}
      onClick={handleViewProduct}
    >
      <div 
        className={`relative bg-gray-100 flex-shrink-0 ${
          wide ? 'w-1/3 h-full' : 'aspect-square w-full'
        }`}
      >
        <img 
          src={product.image_url || placeholderImage}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {product.stock_quantity !== null && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <Badge className="absolute top-1 left-1 bg-amber-500 text-xs">
            Only {product.stock_quantity} left
          </Badge>
        )}
        
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <div className={wide ? 'flex-1 flex flex-col' : ''}>
        <CardContent className={wide ? 'flex-1 p-2 sm:p-4' : 'p-2 sm:p-4'}>
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{product.vendor?.business_name}</span>
              {product.vendor?.is_verified && (
                <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
            
            {product.metrics && (
              <div className="flex items-center text-xs text-gray-500">
                <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                {product.metrics.views || 0}
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-sm line-clamp-1">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-1 sm:line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <p className="font-bold text-sm sm:text-base text-artijam-purple">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
            </p>
            
            {product.category && (
              <Badge variant="secondary" className="text-xs hidden xs:inline-flex">
                {product.category}
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className={`bg-gray-50 p-2 ${wide ? 'mt-auto' : ''}`}>
          {isVendorView && onDelete ? (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              Delete Product
            </Button>
          ) : (
            <Button 
              onClick={(e) => handleAddToCart(e)}
              className="w-full bg-artijam-purple hover:bg-artijam-purple/90 text-xs sm:text-sm h-8 sm:h-9"
              disabled={!product.is_available || product.stock_quantity === 0}
              size="sm"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add to Cart
            </Button>
          )}
        </CardFooter>
      </div>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <DeleteProductDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          item={product}
          isDeleting={isDeleting}
          type="product"
        />
      )}
    </Card>
  );
};

export default ProductCard;
