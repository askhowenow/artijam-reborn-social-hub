import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/vendor/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, Calendar } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface VendorProfile {
  id: string;
  business_name: string;
  business_description: string;
  banner_image_url: string;
  location: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  subdomain?: string;
  uses_subdomain?: boolean;
}

interface StorefrontPageProps {
  vendorId?: string;
}

const StorefrontPage: React.FC<StorefrontPageProps> = ({ vendorId: propVendorId }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const fetchVendorProfile = async () => {
      setLoading(true);
      
      try {
        let vendorProfile;
        
        // If a vendorId is provided directly (from subdomain), use it
        if (propVendorId) {
          const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('id', propVendorId)
            .single();
            
          if (error) throw error;
          vendorProfile = data;
        } else if (slug) {
          // Otherwise use the slug from the URL
          const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('store_slug', slug)
            .single();
            
          if (error) throw error;
          vendorProfile = data;
        } else {
          throw new Error('No vendor identifier provided');
        }

        setVendor(vendorProfile);

        // Fetch products for this vendor
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendorProfile.id)
          .eq('is_available', true);

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch services for this vendor
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('vendor_id', vendorProfile.id)
          .eq('is_available', true);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

      } catch (error) {
        console.error('Error fetching storefront data:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, [slug, navigate, propVendorId]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-artijam-purple mb-4" />
          <p className="text-gray-500">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/shop')}>Browse Shops</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner area */}
      <div className="w-full h-48 md:h-64 bg-gray-200 relative">
        {vendor.banner_image_url ? (
          <img 
            src={vendor.banner_image_url} 
            alt={`${vendor.business_name} banner`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/40 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{vendor.business_name}</h1>
          </div>
        )}
      </div>
      
      {/* Store info */}
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.business_name}</h1>
            {vendor.business_type && (
              <p className="text-gray-600">{vendor.business_type}</p>
            )}
            {vendor.location && (
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{vendor.location}</span>
              </div>
            )}
            {vendor.created_at && (
              <div className="flex items-center text-gray-500 mt-1 text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {vendor.contact_email && (
              <Button variant="outline" size="sm">
                Contact Seller
              </Button>
            )}
            <Button className="bg-artijam-purple hover:bg-artijam-purple/90">
              Follow Store
            </Button>
          </div>
        </div>
        
        {vendor.business_description && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">About This Store</h2>
            <p className="text-gray-700">{vendor.business_description}</p>
          </div>
        )}
        
        {/* Store tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.image_url}
                    category={product.category}
                    vendorSlug={vendor.uses_subdomain && vendor.subdomain ? undefined : slug}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">This store doesn't have any products yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="services">
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <p className="text-artijam-purple font-medium mt-1">${service.price}</p>
                      {service.description && (
                        <p className="text-gray-600 mt-2 text-sm line-clamp-3">{service.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                          {service.duration} min
                        </div>
                        <Button 
                          onClick={() => navigate(`/services/${service.id}`)}
                          size="sm"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">This store doesn't offer any services yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StorefrontPage;
