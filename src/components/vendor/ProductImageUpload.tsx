
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';

interface ProductImageUploadProps {
  previewUrl: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  previewUrl,
  onImageUpload,
  onRemoveImage
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="image">Product Image</Label>
      <div className="border border-dashed rounded-md p-4">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md bg-gray-100">
              <img 
                src={previewUrl} 
                alt="Product Preview" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemoveImage}
              >
                Remove Image
              </Button>
              <label className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  asChild
                >
                  <span>Change Image</span>
                </Button>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer py-6">
            <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
            <span className="text-sm text-gray-500">
              Click to upload a product image
            </span>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ProductImageUpload;
