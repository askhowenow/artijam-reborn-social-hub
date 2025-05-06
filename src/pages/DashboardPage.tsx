
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { Loader2, Store, Package, BarChart, Edit, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { vendorProfile, isLoading } = useVendorProfile();
  
  // Fetch product count for quick stats
  const { data: productStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          throw new Error("Not authenticated");
        }
        
        // Get total product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', session.session.user.id);
          
        if (productError) throw productError;
        
        // Get total active products count
        const { count: activeCount, error: activeError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', session.session.user.id)
          .eq('is_available', true);
          
        if (activeError) throw activeError;
        
        return {
          totalProducts: productCount || 0,
          activeProducts: activeCount || 0
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalProducts: 0, activeProducts: 0 };
      }
    },
    enabled: !!vendorProfile,
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If there's no vendor profile yet, show a CTA to create one
  if (!vendorProfile) {
    return (
      <div className="container max-w-xl mx-auto py-12">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome to Artijam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-600">
              To start selling your products, you need to set up your vendor profile.
            </p>
            <Button 
              onClick={() => navigate("/vendor/profile")} 
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <Store className="mr-2 h-5 w-5" />
              Set Up Vendor Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If vendor profile exists but no storefront has been set up yet
  if (vendorProfile && !vendorProfile.store_slug) {
    return (
      <div className="container max-w-xl mx-auto py-12">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Welcome, {vendorProfile.business_name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Your vendor profile is set up, but you need to create your custom storefront.
            </p>
            <Button 
              onClick={() => navigate("/dashboard/create-storefront")} 
              className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
            >
              <Store className="mr-2 h-5 w-5" />
              Create Storefront
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard for vendors with storefronts
  return (
    <div className="container max-w-6xl mx-auto py-6">
      {/* Header with store info and CTA */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{vendorProfile.business_name}</h1>
          <div className="flex items-center text-gray-500">
            <span>@{vendorProfile.store_slug}</span>
            <a 
              href={`/@${vendorProfile.store_slug}`}
              className="ml-2 text-artijam-purple text-sm hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Public Store
            </a>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/create-storefront")}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Storefront
          </Button>
          <Button
            onClick={() => navigate("/vendor/products/new")}
            className="bg-artijam-purple hover:bg-artijam-purple/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                {statsLoading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold">{productStats?.totalProducts || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-full">
                <Store className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                {statsLoading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold">{productStats?.activeProducts || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-full">
                <BarChart className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sales (Last 30 days)</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Button 
          onClick={() => navigate("/vendor/products")}
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center justify-center gap-3"
        >
          <Package className="h-10 w-10" />
          <span className="text-lg font-medium">Manage Products</span>
        </Button>
        
        <Button 
          onClick={() => navigate("/dashboard/analytics")}
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center justify-center gap-3"
        >
          <BarChart className="h-10 w-10" />
          <span className="text-lg font-medium">View Analytics</span>
        </Button>
        
        <Button 
          onClick={() => window.open(`/@${vendorProfile.store_slug}`, '_blank')}
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center justify-center gap-3"
        >
          <Store className="h-10 w-10" />
          <span className="text-lg font-medium">View Public Store</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
