
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare, Trash2, PlusCircle, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QRCodeModal from "@/components/vendor/QRCodeModal";
import { useVendorProfile } from "@/hooks/use-vendor-profile";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean | null;
};

const VendorProducts = () => {
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
  
  // Handle QR code generation for the entire store
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
      <div className="bg-white rounded-md p-10 text-center shadow">
        <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
        <p className="text-gray-500 mb-6">
          You haven't added any products to your store yet.
        </p>
        <Button 
          onClick={() => navigate('/vendor/products/new')}
          className="bg-artijam-purple hover:bg-artijam-purple/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Your First Product
        </Button>
      </div>
    );
  }

  if (!vendorProfile?.store_slug) {
    return (
      <div className="bg-white rounded-md p-10 text-center shadow">
        <h3 className="text-lg font-medium mb-2">Store URL Required</h3>
        <p className="text-gray-500 mb-6">
          You need to set up your store URL before you can generate QR codes.
        </p>
        <Button 
          onClick={() => navigate('/vendor/profile')}
          className="bg-artijam-purple hover:bg-artijam-purple/90"
        >
          Setup Store URL
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Products</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleStoreQRCodeGenerate}
          >
            <QrCode className="h-4 w-4" />
            Store QR Code
          </Button>
          <Button 
            className="bg-artijam-purple hover:bg-artijam-purple/90"
            onClick={() => navigate('/vendor/products/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="h-40 w-full md:w-40 bg-gray-100 flex-shrink-0">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="font-bold text-artijam-purple">${product.price.toFixed(2)}</p>
                </div>
                
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.description || "No description provided."}
                </p>
                
                <div className="flex flex-wrap items-center mt-2 gap-2">
                  {product.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {product.category}
                    </span>
                  )}
                  
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    Stock: {product.stock_quantity || 0}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.is_available 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {product.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQRCodeGenerate(product)}
                  >
                    <QrCode className="h-4 w-4 mr-1" /> QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                  >
                    <PenSquare className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

const Package = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export default VendorProducts;
