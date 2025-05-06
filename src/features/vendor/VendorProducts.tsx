
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCodeModal from "@/components/vendor/QRCodeModal";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import ProductCard from "@/components/vendor/ProductCard";
import ProductPlaceholder from "@/components/vendor/ProductPlaceholder";
import ProductsHeader from "@/components/vendor/ProductsHeader";
import { Product } from "@/hooks/use-products";
import { toast } from "sonner";

interface VendorProductsProps {
  showHeader?: boolean;
}

const VendorProducts = ({ showHeader = true }: VendorProductsProps) => {
  const navigate = useNavigate();
  const { vendorProfile } = useVendorProfile();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);
  
  // Storage check runs only once
  useEffect(() => {
    const checkStoragePermissions = async () => {
      if (storageChecked) return;
      
      try {
        // Verify buckets exist
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Storage check - Error listing buckets:", bucketsError);
          return;
        }
        
        console.log("Storage check - Available buckets:", buckets?.map(b => b.name).join(", "));
        setStorageChecked(true);
      } catch (error: any) {
        console.error("Storage check failed:", error);
      } finally {
        setStorageChecked(true);
      }
    };
    
    checkStoragePermissions();
  }, [storageChecked]);
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: async () => {
      console.log("Fetching vendor products");
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log("No authenticated user found");
        return [];
      }
      
      const userId = session.session.user.id;
      console.log(`Fetching products for vendor: ${userId}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching vendor products:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} products for this vendor`);
      return data as Product[];
    },
  });

  const handleQRCodeGenerate = (product: Product) => {
    setSelectedProduct(product);
    setQrModalOpen(true);
  };
  
  const handleStoreQRCodeGenerate = () => {
    setSelectedProduct(null);
    setQrModalOpen(true);
  };

  if (error) {
    console.error("Error in VendorProducts:", error);
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-700">Failed to load products. Please try again.</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <ProductPlaceholder
        message="No Products Yet"
        description="You haven't added any products to your store yet."
        buttonText="Add Your First Product"
        buttonAction={() => navigate('/vendor/products/new')}
      />
    );
  }

  if (!vendorProfile?.store_slug) {
    return (
      <ProductPlaceholder
        message="Store URL Required"
        description="You need to set up your store URL before you can generate QR codes."
        buttonText="Setup Store URL"
        buttonAction={() => navigate('/vendor/profile')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <ProductsHeader onStoreQRCodeGenerate={handleStoreQRCodeGenerate} />
      )}

      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onQRCodeGenerate={handleQRCodeGenerate}
        />
      ))}

      {/* QR Code Modal */}
      {vendorProfile && (
        <QRCodeModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          storeSlug={vendorProfile.store_slug || ""}
          productId={selectedProduct?.id}
          businessName={vendorProfile.business_name}
          productName={selectedProduct?.name}
        />
      )}
    </div>
  );
};

export default VendorProducts;
