
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Store, ImageIcon, Check, X, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useVendorSubdomain } from "@/hooks/use-vendor-subdomain";
import { slugify } from "@/utils/string-utils";

const StorefrontCreation = () => {
  const navigate = useNavigate();
  const { vendorProfile, isLoading, updateVendorProfile } = useVendorProfile();
  const { isChecking, isAvailable, checkSubdomainAvailability } = useVendorSubdomain();
  
  const [businessName, setBusinessName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [usesSubdomain, setUsesSubdomain] = useState(false);
  const [businessDescription, setBusinessDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSubdomainUrl, setPreviewSubdomainUrl] = useState<string | null>(null);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing data if vendor profile exists
  useEffect(() => {
    if (vendorProfile) {
      setBusinessName(vendorProfile.business_name || "");
      setBusinessDescription(vendorProfile.business_description || "");
      setBannerImageUrl(vendorProfile.banner_image_url || null);
      setStoreSlug(vendorProfile.store_slug || "");
      setSubdomain(vendorProfile.subdomain || "");
      setUsesSubdomain(vendorProfile.uses_subdomain || false);
      
      if (vendorProfile.store_slug) {
        setIsSlugAvailable(true);
        setPreviewUrl(`/@${vendorProfile.store_slug}`);
      }
      
      if (vendorProfile.subdomain) {
        setPreviewSubdomainUrl(`https://${vendorProfile.subdomain}.artijam.com`);
      }
    }
  }, [vendorProfile]);

  // Generate slug from business name
  const generateSlug = (name: string) => {
    const slug = slugify(name);
    setStoreSlug(slug);
    checkSlugAvailability(slug);
  };

  // Handle business name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setBusinessName(name);
    
    if (name.length > 2) {
      generateSlug(name);
      
      // Also suggest a subdomain if not already set
      if (!subdomain) {
        const suggestedSubdomain = slugify(name);
        setSubdomain(suggestedSubdomain);
        checkSubdomainAvailability(suggestedSubdomain);
        setPreviewSubdomainUrl(`https://${suggestedSubdomain}.artijam.com`);
      }
    } else {
      setStoreSlug("");
      setIsSlugAvailable(null);
      setPreviewUrl(null);
    }
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = slugify(e.target.value);
    setStoreSlug(slug);
    checkSlugAvailability(slug);
  };
  
  // Handle subdomain change
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    
    if (value.length >= 3) {
      checkSubdomainAvailability(value);
      setPreviewSubdomainUrl(`https://${value}.artijam.com`);
    } else {
      setPreviewSubdomainUrl(null);
    }
  };

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setIsSlugAvailable(null);
      setPreviewUrl(null);
      return;
    }

    setIsChecking(true);
    setPreviewUrl(`/@${slug}`);

    try {
      // Check if the slug already exists (excluding the current vendor's slug)
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('store_slug', slug)
        .neq('id', vendorProfile?.id || '')
        .maybeSingle();

      if (error) throw error;
      
      // If data exists, the slug is taken
      setIsSlugAvailable(data === null);
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setIsSlugAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle banner image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setBannerImageUrl(objectUrl);

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName) {
      toast.error("Business name is required");
      return;
    }

    if (!isSlugAvailable) {
      toast.error("Please choose a unique store slug");
      return;
    }
    
    if (usesSubdomain && (!subdomain || isAvailable === false)) {
      toast.error("Please choose a valid, available subdomain or disable subdomain access");
      return;
    }

    setSaving(true);
    
    try {
      // Upload banner image if selected
      let uploadedBannerUrl = bannerImageUrl;
      
      if (bannerImage) {
        const fileName = `${Date.now()}-${bannerImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('store-banners')
          .upload(fileName, bannerImage);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('store-banners')
          .getPublicUrl(fileName);

        uploadedBannerUrl = publicUrlData.publicUrl;
      }

      // Update vendor profile with store slug and banner image
      await updateVendorProfile.mutateAsync({
        business_name: businessName,
        business_description: businessDescription,
        store_slug: storeSlug,
        banner_image_url: uploadedBannerUrl,
        subdomain: usesSubdomain ? subdomain : null,
        uses_subdomain: usesSubdomain,
        business_type: vendorProfile?.business_type || null,
        contact_email: vendorProfile?.contact_email || null,
        contact_phone: vendorProfile?.contact_phone || null,
        location: vendorProfile?.location || null,
        website: vendorProfile?.website || null
      });

      toast.success("Storefront created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving storefront:", error);
      toast.error(error.message || "Failed to create storefront");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Store className="mr-2 h-6 w-6" /> Create Your Storefront
          </CardTitle>
          <CardDescription>
            Set up your online store with a unique URL and branding
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Store Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={handleNameChange}
                  placeholder="Your store name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeSlug">
                  Store URL Slug *
                  {isChecking && (
                    <span className="ml-2 text-sm text-gray-500">Checking...</span>
                  )}
                  {isSlugAvailable === true && !isChecking && (
                    <span className="ml-2 text-sm text-green-500 flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Available
                    </span>
                  )}
                  {isSlugAvailable === false && !isChecking && (
                    <span className="ml-2 text-sm text-red-500 flex items-center">
                      <X className="h-4 w-4 mr-1" /> Not available
                    </span>
                  )}
                </Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md">
                    @
                  </span>
                  <Input
                    id="storeSlug"
                    value={storeSlug}
                    onChange={handleSlugChange}
                    placeholder="your-store-name"
                    className="rounded-l-none"
                    required
                  />
                </div>
                {previewUrl && (
                  <p className="text-sm text-gray-500">
                    Your store will be available at: <span className="font-medium">{previewUrl}</span>
                  </p>
                )}
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subdomain" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" /> Custom Subdomain (Optional)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-subdomain"
                      checked={usesSubdomain}
                      onCheckedChange={setUsesSubdomain}
                    />
                    <Label htmlFor="use-subdomain" className="text-sm cursor-pointer">Enable</Label>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md">
                    https://
                  </span>
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={handleSubdomainChange}
                    placeholder="your-store"
                    className="rounded-l-none rounded-r-none border-r-0"
                    disabled={!usesSubdomain}
                  />
                  <span className="bg-gray-100 px-3 py-2 border border-l-0 rounded-r-md">
                    .artijam.com
                  </span>
                </div>
                
                {isChecking && (
                  <p className="text-sm text-gray-500">Checking availability...</p>
                )}
                {isAvailable === true && !isChecking && subdomain && (
                  <p className="text-sm text-green-500 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Subdomain is available
                  </p>
                )}
                {isAvailable === false && !isChecking && subdomain && (
                  <p className="text-sm text-red-500 flex items-center">
                    <X className="h-4 w-4 mr-1" /> Subdomain is not available
                  </p>
                )}
                {previewSubdomainUrl && usesSubdomain && (
                  <p className="text-sm text-gray-500">
                    Your store will also be available at: <span className="font-medium">{previewSubdomainUrl}</span>
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="businessDescription">Store Description</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your store and what you sell"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bannerImage">Store Banner Image</Label>
                <div className="border border-dashed rounded-md p-4">
                  {bannerImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md bg-gray-100">
                        <img 
                          src={bannerImageUrl} 
                          alt="Store Banner Preview" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBannerImage(null);
                          setBannerImageUrl(null);
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                      <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload a banner image
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Recommended size: 1200 × 400px
                      </span>
                      <input
                        id="bannerImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={
                  saving || 
                  !isSlugAvailable || 
                  !businessName || 
                  (usesSubdomain && (!subdomain || isAvailable === false))
                }
                className="bg-artijam-purple hover:bg-artijam-purple/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Storefront"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontCreation;
