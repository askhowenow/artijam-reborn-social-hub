
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVendorProfile, VendorProfileFormData } from "@/hooks/use-vendor-profile";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slugify } from "@/utils/string-utils";

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: userLoading } = useUserProfile();
  const { vendorProfile, isLoading: vendorLoading, createVendorProfile, updateVendorProfile } = useVendorProfile();
  
  const [formData, setFormData] = useState<VendorProfileFormData>({
    business_name: "",
    business_description: "",
    business_type: "",
    contact_email: "",
    contact_phone: "",
    location: "",
    website: "",
    store_slug: "",
    banner_image_url: "",
    subdomain: "",
    uses_subdomain: false
  });
  
  const [saving, setSaving] = useState(false);
  const isNewVendor = !vendorProfile;

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Populate form with existing data if vendor profile exists
    if (vendorProfile) {
      setFormData({
        business_name: vendorProfile.business_name || "",
        business_description: vendorProfile.business_description || "",
        business_type: vendorProfile.business_type || "",
        contact_email: vendorProfile.contact_email || "",
        contact_phone: vendorProfile.contact_phone || "",
        location: vendorProfile.location || "",
        website: vendorProfile.website || "",
        store_slug: vendorProfile.store_slug || "",
        banner_image_url: vendorProfile.banner_image_url || "",
        subdomain: vendorProfile.subdomain || "",
        uses_subdomain: vendorProfile.uses_subdomain || false
      });
    }
  }, [vendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate store slug from business name if this is the business name field
    if (name === 'business_name' && !formData.store_slug) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        store_slug: slugify(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isNewVendor) {
        await createVendorProfile.mutateAsync(formData);
        navigate("/vendor/dashboard");
      } else {
        await updateVendorProfile.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error saving vendor profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || vendorLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {isNewVendor ? "Become a Vendor" : "Edit Vendor Profile"}
            </CardTitle>
            {!isNewVendor && (
              <Button variant="outline" onClick={() => navigate("/vendor/dashboard")}>
                View Dashboard
              </Button>
            )}
          </div>
          {isNewVendor && (
            <p className="text-gray-600 mt-2">
              Set up your vendor profile to start selling products and services on Artijam.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Your business name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="store_slug">Store URL *</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 text-gray-500 border border-r-0 border-gray-300 rounded-l-md">
                    @
                  </span>
                  <Input
                    id="store_slug"
                    name="store_slug"
                    value={formData.store_slug}
                    onChange={handleChange}
                    placeholder="your-store-name"
                    className="rounded-l-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be the URL for your store: @{formData.store_slug || "your-store-name"}
                </p>
              </div>
              
              <div>
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  id="business_description"
                  name="business_description"
                  value={formData.business_description || ""}
                  onChange={handleChange}
                  placeholder="Describe your business"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="banner_image_url">Banner Image URL</Label>
                <Input
                  id="banner_image_url"
                  name="banner_image_url"
                  value={formData.banner_image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL for your store's banner image
                </p>
              </div>
              
              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  name="business_type"
                  value={formData.business_type || ""}
                  onChange={handleChange}
                  placeholder="e.g. Retail, Service, Entertainment"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={handleChange}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone || ""}
                    onChange={handleChange}
                    placeholder="Your contact number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(isNewVendor ? "/profile" : "/vendor/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving || !formData.business_name || !formData.store_slug}
                className="bg-artijam-purple hover:bg-artijam-purple/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isNewVendor ? (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Create Vendor Profile
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfilePage;
