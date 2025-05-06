
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCodeModal from "@/components/vendor/QRCodeModal";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import ProductCard, { Product } from "@/components/vendor/ProductCard";
import ProductPlaceholder from "@/components/vendor/ProductPlaceholder";
import ProductsHeader from "@/components/vendor/ProductsHeader";

interface VendorProductsProps {
  showHeader?: boolean;
}

const VendorProducts = ({ showHeader = true }: VendorProductsProps) => {
  const navigate = useNavigate();
  const { vendorProfile } = useVendorProfile();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', session.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
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
