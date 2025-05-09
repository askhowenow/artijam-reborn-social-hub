
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Trash2 } from 'lucide-react';
import { Upload3d } from '@/components/icons/Upload3d';
import { SUPPORTED_MODEL_FORMATS, MAX_MODEL_SIZE } from '@/utils/model-upload';

interface Product3DModelUploadProps {
  modelUrl: string | null;
  onModelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveModel: () => void;
  isUploading?: boolean;
}

const Product3DModelUpload: React.FC<Product3DModelUploadProps> = ({
  modelUrl,
  onModelUpload,
  onRemoveModel,
  isUploading = false
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const maxSizeMB = MAX_MODEL_SIZE / (1024 * 1024);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        3D Model
        <span className="text-xs text-gray-500 font-normal">
          (Optional - Supported formats: {SUPPORTED_MODEL_FORMATS.join(', ')})
        </span>
      </Label>
      
      <div className="border border-dashed rounded-md p-4 bg-gray-50">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onModelUpload}
          className="hidden"
          accept={SUPPORTED_MODEL_FORMATS.join(',')}
        />
        
        {!modelUrl ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-gray-500">
            <Upload3d className="h-10 w-10" />
            <p className="text-sm">Drag & drop your 3D model file here or click to browse</p>
            <p className="text-xs">Max size: {maxSizeMB}MB</p>
            <Button 
              type="button" 
              variant="secondary"
              size="sm"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Select 3D Model'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between p-2 bg-white border rounded-md">
              <div className="flex items-center gap-2">
                <Upload3d className="h-5 w-5 text-artijam-purple" />
                <div>
                  <p className="text-sm font-medium">3D Model Added</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {modelUrl.split('/').pop()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveModel}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-3 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
              >
                Replace
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Adding a 3D model enables customers to view your product in augmented reality on supported devices.
      </p>
    </div>
  );
};

export default Product3DModelUpload;
