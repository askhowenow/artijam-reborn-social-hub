
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Package, Settings, DollarSign, LineChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import VendorProducts from "@/features/vendor/VendorProducts";
import VendorOrders from "@/features/vendor/VendorOrders";
import VendorStats from "@/features/vendor/VendorStats";

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const { vendorProfile, isLoading } = useVendorProfile();
  
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
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate("/vendor/profile")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
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
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center gap-3">
                <Package className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-center gap-3">
                <DollarSign className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <div className="flex items-center gap-3">
                <LineChart className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <VendorProducts />
        </TabsContent>
        
        <TabsContent value="orders">
          <VendorOrders />
        </TabsContent>
        
        <TabsContent value="analytics">
          <VendorStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboardPage;
