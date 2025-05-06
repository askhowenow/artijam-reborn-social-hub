
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import VendorProducts from "@/features/vendor/VendorProducts";
import { useVendorProfile } from "@/hooks/use-vendor-profile";

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { vendorProfile, isLoading } = useVendorProfile();

  if (isLoading || !vendorProfile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin text-artijam-purple border-4 border-artijam-purple border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <Helmet>
        <title>My Products | ArtiJam</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-gray-500">Manage your store's products</p>
        </div>
        
        <Button 
          onClick={() => navigate("/vendor/products/new")}
          className="bg-artijam-purple hover:bg-artijam-purple/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>
      
      <VendorProducts showHeader={false} />
    </div>
  );
};

export default MyProductsPage;
