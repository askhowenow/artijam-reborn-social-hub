
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
  is_available: boolean;
};

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { vendorProfile, isLoading: vendorLoading } = useVendorProfile();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock_quantity: "0",
    is_available: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEditing = !!productId;

  // Fetch product data if editing
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    // Check if user is authenticated and is a vendor
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Populate form with existing data if editing
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price.toString() || "",
        category: product.category || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        is_available: product.is_available ?? true,
      });
      
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!vendorProfile) {
        throw new Error("Vendor profile not found");
      }
      
      let imageUrl = null;
      
      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${vendorProfile.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Create product
      const { error } = await supabase
        .from('products')
        .insert({
          vendor_id: vendorProfile.id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          is_available: formData.is_available,
          image_url: imageUrl,
        });
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success("Product created successfully");
        queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
        navigate("/vendor/dashboard");
      },
      onError: (error: Error) => {
        console.error("Error creating product:", error);
        toast.error("Failed to create product. Please try again.");
      }
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!vendorProfile || !productId) {
        throw new Error("Missing required information");
      }
      
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${vendorProfile.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          is_available: formData.is_available,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
      
      if (error) throw error;
      
      return true;
    },
    meta: {
      onSuccess: () => {
        toast.success("Product updated successfully");
        queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        navigate("/vendor/dashboard");
      },
      onError: (error: Error) => {
        console.error("Error updating product:", error);
        toast.error("Failed to update product. Please try again.");
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.name) {
        toast.error("Product name is required");
        setSaving(false);
        return;
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        toast.error("Valid price is required");
        setSaving(false);
        return;
      }
      
      // Submit form
      if (isEditing) {
        await updateProductMutation.mutateAsync(formData);
      } else {
        await createProductMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSaving(false);
    }
  };

  if (vendorLoading || (isEditing && productLoading)) {
    return (
      <div className="container max-w-2xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to vendor profile if user is not a vendor
  if (!vendorLoading && !vendorProfile) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <p className="mb-4">You need to set up your vendor profile first.</p>
            <Button 
              onClick={() => navigate("/vendor/profile")}
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              Set Up Vendor Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Image */}
            <div className="flex flex-col items-center">
              <div className="relative w-full h-56 bg-gray-100 rounded-md overflow-hidden mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Product preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <ImagePlus className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <input
                    type="file"
                    className="hidden"
                    id="product-image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="product-image" 
                    className="bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100"
                  >
                    <ImagePlus className="h-5 w-5 text-gray-700" />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">Click to upload a product image</p>
            </div>
            
            <div className="space-y-4">
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
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Electronics, Clothing, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_available">Product is available for purchase</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/vendor/dashboard")}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="bg-artijam-purple hover:bg-artijam-purple/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Product" : "Save Product"}
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

export default ProductFormPage;
