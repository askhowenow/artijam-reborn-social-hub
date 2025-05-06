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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/utils/string-utils';

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
    currency: 'USD'
  });
  
  // UI state
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);

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
            currency: data.currency || 'USD'
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

  // Calculate profit margin when prices change
  useEffect(() => {
    const salesPrice = formData.price;
    const purchasePrice = formData.purchase_price;
    
    const margin = salesPrice - purchasePrice;
    setProfitMargin(margin);
    
    const percentage = purchasePrice > 0 
      ? ((salesPrice - purchasePrice) / purchasePrice) * 100 
      : 0;
    setProfitPercentage(percentage);
  }, [formData.price, formData.purchase_price]);

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Not authenticated');
      }
      
      let imageUrl = productData.image_url;
      
      // Upload image if provided
      if (image) {
        const fileName = `${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
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
          currency: productData.currency
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
        toast.success('Product created successfully');
        navigate('/vendor/products');
      },
      onError: (error: any) => {
        toast.error(`Failed to create product: ${error.message}`);
      }
    }
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      let imageUrl = productData.image_url;
      
      // Upload image if provided
      if (image) {
        const fileName = `${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
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
          currency: productData.currency
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
      setImage(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up preview URL on unmount
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(formData);
      } else {
        await createProduct.mutateAsync(formData);
      }
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

  const categories = [
    'Art & Crafts',
    'Clothing',
    'Digital Products',
    'Food & Beverage',
    'Home Decor',
    'Jewelry',
    'Services',
    'Other'
  ];

  const currencies = [
    'USD',
    'JMD',
    'EUR',
    'GBP',
    'CAD'
  ];

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
                        onClick={() => {
                          setImage(null);
                          setPreviewUrl(null);
                          setFormData(prev => ({ ...prev, image_url: null }));
                        }}
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
                          onChange={handleImageUpload}
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
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            
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
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="font-medium text-lg mb-4">Pricing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_price">
                    Purchase Price *
                    <span className="text-xs text-gray-500 ml-1">(Only visible to you)</span>
                  </Label>
                  <Input
                    type="number"
                    id="purchase_price"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleNumberChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="Your cost price"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">
                    Sales Price *
                    <span className="text-xs text-gray-500 ml-1">(Public price)</span>
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="Public selling price"
                  />
                </div>
              </div>
              
              {/* Profit calculation */}
              {formData.purchase_price > 0 && formData.price > 0 && (
                <div className="mt-4 p-2 rounded bg-white">
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin:</span>
                    <span className={profitMargin >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {formatPrice(profitMargin, formData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Percentage:</span>
                    <span className={profitPercentage >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {profitPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
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
