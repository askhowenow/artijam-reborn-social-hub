
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  PlusCircle, 
  Package, 
  Settings, 
  DollarSign, 
  LineChart,
  QrCode,
  Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import VendorProducts from "@/features/vendor/VendorProducts";
import VendorOrders from "@/features/vendor/VendorOrders";
import VendorStats from "@/features/vendor/VendorStats";
import VendorServices from "@/features/vendor/VendorServices";
import VendorBookings from "@/features/vendor/VendorBookings";
import QRCodeModal from "@/components/vendor/QRCodeModal";

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const { vendorProfile, isLoading } = useVendorProfile();
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [storeStats, setStoreStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
    totalServices: 0,
    totalBookings: 0
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }
      
      // If user is authenticated but not a vendor, redirect to vendor registration
      if (!isLoading && !vendorProfile) {
        toast.info("You need to set up your vendor profile first");
        navigate("/vendor/profile");
      }
    };
    
    checkAuth();
  }, [navigate, isLoading, vendorProfile]);

  useEffect(() => {
    // Fetch store statistics when vendor profile is loaded
    const fetchStoreStats = async () => {
      if (!vendorProfile) return;
      
      try {
        // Get total product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendorProfile.id);
        
        if (productError) throw productError;
        
        // Get total service count
        const { count: serviceCount, error: serviceError } = await supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendorProfile.id);
        
        if (serviceError) throw serviceError;
        
        // First, get all product IDs belonging to this vendor
        const { data: productIds, error: productIdsError } = await supabase
          .from('products')
          .select('id')
          .eq('vendor_id', vendorProfile.id);
          
        if (productIdsError) throw productIdsError;
        
        // Get total bookings count
        const { count: bookingCount, error: bookingError } = await supabase
          .from('service_bookings')
          .select(`
            id,
            service:service_id(vendor_id)
          `, { count: 'exact' })
          .eq('service.vendor_id', vendorProfile.id);
        
        let totalBookings = 0;
        if (!bookingError) {
          totalBookings = bookingCount || 0;
        }
        
        // Now use those IDs to get metrics
        let totalViews = 0;
        if (productIds && productIds.length > 0) {
          const productIdArray = productIds.map(item => item.id);
          
          const { data: metricsData, error: metricsError } = await supabase
            .from('product_metrics')
            .select('views, product_id')
            .in('product_id', productIdArray);
          
          if (metricsError) throw metricsError;
          
          // Calculate total views
          totalViews = metricsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
        }
        
        setStoreStats({
          totalProducts: productCount || 0,
          totalViews,
          totalSales: 0, // In a real app, this would come from order data
          totalServices: serviceCount || 0,
          totalBookings
        });
      } catch (error) {
        console.error("Error fetching store stats:", error);
      }
    };
    
    fetchStoreStats();
  }, [vendorProfile]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  // If no vendor profile is found, this shouldn't actually render as the useEffect above
  // will redirect the user, but we'll add this check anyway
  if (!vendorProfile) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{vendorProfile.business_name}</h1>
          <p className="text-gray-500">{vendorProfile.business_type || "Vendor"}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
          <Button
            variant="outline"
            onClick={() => setQrCodeModalOpen(true)}
            disabled={!vendorProfile.store_slug}
            className="flex-grow md:flex-grow-0"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Store QR Code
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/vendor/profile")}
            className="flex-grow md:flex-grow-0"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            onClick={() => navigate("/vendor/products/new")}
            className="bg-artijam-purple hover:bg-artijam-purple/90 flex-grow md:flex-grow-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-blue-50 p-3 md:p-4 rounded-md">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-xl md:text-2xl font-bold">{storeStats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 md:p-4 rounded-md">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl md:text-2xl font-bold">${storeStats.totalSales.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-3 md:p-4 rounded-md">
              <div className="flex items-center gap-3">
                <LineChart className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p className="text-xl md:text-2xl font-bold">{storeStats.totalViews}</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-3 md:p-4 rounded-md">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Services</p>
                  <p className="text-xl md:text-2xl font-bold">{storeStats.totalServices}</p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-3 md:p-4 rounded-md">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Bookings</p>
                  <p className="text-xl md:text-2xl font-bold">{storeStats.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="products">
        <div className="overflow-x-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="products">
          <VendorProducts />
        </TabsContent>

        <TabsContent value="services">
          <VendorServices />
        </TabsContent>
        
        <TabsContent value="orders">
          <VendorOrders />
        </TabsContent>
        
        <TabsContent value="bookings">
          <VendorBookings />
        </TabsContent>
        
        <TabsContent value="analytics">
          <VendorStats />
        </TabsContent>
      </Tabs>

      {/* Store QR Code Modal */}
      {vendorProfile.store_slug && (
        <QRCodeModal
          open={qrCodeModalOpen}
          onOpenChange={setQrCodeModalOpen}
          storeSlug={vendorProfile.store_slug || ""}
          businessName={vendorProfile.business_name}
        />
      )}
    </div>
  );
};

export default VendorDashboardPage;
