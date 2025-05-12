
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductImageProps {
  imageUrl: string | null;
  productName: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, productName, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {!imageUrl || hasError ? (
        <div className="bg-gray-100 h-full w-full flex items-center justify-center text-gray-400">
          <span className="text-sm">No image</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={productName}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default ProductImage;
