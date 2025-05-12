import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { uploadProductImage, checkStorageBuckets } from '@/utils/product-image-upload';
import { uploadProductModel, checkModelStorageBucket } from '@/utils/model-upload';
import ProductImageUpload from './ProductImageUpload';
import Product3DModelUpload from './Product3DModelUpload';
import ProductCategorySelector from './ProductCategorySelector';
import ProductPricingSection from './ProductPricingSection';

// Define product interface
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  purchase_price: number;
  image_url: string | null;
  category: string;
  stock_quantity: number;
  is_available: boolean;
  currency: string;
  model_url: string | null;
  model_format: string | null;
  has_ar_model: boolean;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    purchase_price: 0,
    image_url: null,
    category: '',
    stock_quantity: 1,
    is_available: true,
    currency: 'USD',
    model_url: null,
    model_format: null,
    has_ar_model: false
  });
  
  // UI state
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageChecked, setStorageChecked] = useState(false);
  
  // 3D model upload state
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const [modelUploadError, setModelUploadError] = useState<string | null>(null);

  // Fetch product data for edit mode
  const { isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!isEditMode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
    meta: {
      onSuccess: (data: any) => {
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            purchase_price: data.purchase_price || 0,
            image_url: data.image_url || null,
            category: data.category || '',
            stock_quantity: data.stock_quantity || 1,
            is_available: data.is_available ?? true,
            currency: data.currency || 'USD',
            model_url: data.model_url || null,
            model_format: data.model_format || null,
            has_ar_model: data.has_ar_model || false
          });
          
          if (data.image_url) {
            setPreviewUrl(data.image_url);
          }
        }
      },
      onError: (error: Error) => {
        toast.error(`Failed to load product: ${error.message}`);
        navigate('/vendor/products');
      }
    }
  });

  // Verify storage buckets exist
  useEffect(() => {
    if (!storageChecked) {
      Promise.all([
        checkStorageBuckets(),
        checkModelStorageBucket()
      ]).then(([imagesExist, modelsExist]) => {
        setStorageChecked(true);
        if (!modelsExist) {
          console.warn('product-models bucket not found');
        }
      });
    }
  }, [storageChecked]);
  
  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      console.log('Starting product creation...');
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Not authenticated');
      }
      
      let imageUrl = productData.image_url;
      let modelUrl = productData.model_url;
      let modelFormat = productData.model_format;
      let hasArModel = productData.has_ar_model;
      
      // Upload image if provided
      if (image) {
        console.log('Image found, attempting upload...');
        imageUrl = await uploadProductImage(image);
        if (!imageUrl && uploadError) {
          throw new Error(uploadError);
        }
      }
      
      // Upload 3D model if provided
      if (modelFile) {
        console.log('3D model found, attempting upload...');
        const modelData = await uploadProductModel(modelFile, session.session.user.id);
        
        if (modelData.error) {
          throw new Error(modelData.error);
        }
        
        modelUrl = modelData.url;
        modelFormat = modelData.format;
        hasArModel = !!modelUrl;
      }
      
      console.log('Creating product record with image URL:', imageUrl, 'and model URL:', modelUrl);
      
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          purchase_price: productData.purchase_price,
          image_url: imageUrl,
          category: productData.category,
          stock_quantity: productData.stock_quantity,
          is_available: productData.is_available,
          vendor_id: session.session.user.id,
          currency: productData.currency,
          model_url: modelUrl,
          model_format: modelFormat,
          has_ar_model: hasArModel
        })
        .select()
        .single();
      
      if (error) {
        console.error('Product insert error:', error);
        throw error;
      }
      
      return data;
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
        toast.success('Product created successfully');
        navigate('/vendor/products');
      },
      onError: (error: any) => {
        console.error('Product creation error:', error);
        toast.error(`Failed to create product: ${error.message}`);
      }
    }
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      let imageUrl = productData.image_url;
      let modelUrl = productData.model_url;
      let modelFormat = productData.model_format;
      let hasArModel = productData.has_ar_model;
      
      // Upload image if provided
      if (image) {
        imageUrl = await uploadProductImage(image);
        if (!imageUrl && uploadError) {
          throw new Error(uploadError);
        }
      }
      
      // Upload 3D model if provided
      if (modelFile) {
        const modelData = await uploadProductModel(modelFile, id as string);
        
        if (modelData.error) {
          throw new Error(modelData.error);
        }
        
        modelUrl = modelData.url;
        modelFormat = modelData.format;
        hasArModel = !!modelUrl;
      }
      
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          purchase_price: productData.purchase_price,
          image_url: imageUrl,
          category: productData.category,
          stock_quantity: productData.stock_quantity,
          is_available: productData.is_available,
          updated_at: new Date().toISOString(),
          currency: productData.currency,
          model_url: modelUrl,
          model_format: modelFormat,
          has_ar_model: hasArModel
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
        queryClient.invalidateQueries({ queryKey: ['product', id] });
        toast.success('Product updated successfully');
        navigate('/vendor/products');
      },
      onError: (error: any) => {
        toast.error(`Failed to update product: ${error.message}`);
      }
    }
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle availability toggle
  const handleAvailabilityChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_available: checked }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // Handle currency selection
  const handleCurrencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, currency: value }));
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      
      setImage(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Handle removing image
  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, image_url: null }));
  };
  
  // Handle 3D model upload
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModelFile(file);
      setFormData(prev => ({ 
        ...prev,
        // We don't set model_url here as it's generated during submission
        model_format: file.name.split('.').pop()?.toLowerCase() || null,
        has_ar_model: true 
      }));
    }
  };
  
  // Handle removing 3D model
  const handleRemoveModel = () => {
    setModelFile(null);
    setFormData(prev => ({ 
      ...prev, 
      model_url: null,
      model_format: null,
      has_ar_model: false
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.name.trim()) {
        toast.error("Product name is required");
        setIsSubmitting(false);
        return;
      }
      
      if (formData.price <= 0) {
        toast.error("Price must be greater than zero");
        setIsSubmitting(false);
        return;
      }
      
      console.log('Form submission started. Edit mode:', isEditMode);
      
      if (isEditMode) {
        await updateProduct.mutateAsync(formData);
      } else {
        await createProduct.mutateAsync(formData);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/vendor/products')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Image */}
            <ProductImageUpload 
              previewUrl={previewUrl} 
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
            />
            
            {/* Basic Info */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProductCategorySelector
                selectedCategory={formData.category}
                onCategoryChange={handleCategoryChange}
              />
              
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleNumberChange}
                  min="0"
                  required
                />
              </div>
            </div>
            
            {/* Pricing Section */}
            <ProductPricingSection
              price={formData.price}
              purchasePrice={formData.purchase_price}
              currency={formData.currency}
              onPriceChange={handleNumberChange}
              onPurchasePriceChange={handleNumberChange}
              onCurrencyChange={handleCurrencyChange}
            />
            
            {/* 3D Model Upload Section */}
            <Product3DModelUpload
              modelUrl={formData.model_url}
              onModelUpload={handleModelUpload}
              onRemoveModel={handleRemoveModel}
              isUploading={isUploadingModel}
            />
            
            {modelUploadError && (
              <div className="text-red-500 text-sm">{modelUploadError}</div>
            )}
            
            {/* Availability */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={handleAvailabilityChange}
              />
              <Label htmlFor="is_available">Product is available for purchase</Label>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/vendor/products')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-artijam-purple hover:bg-artijam-purple/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
