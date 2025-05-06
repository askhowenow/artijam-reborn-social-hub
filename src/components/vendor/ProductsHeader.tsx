
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductsHeaderProps {
  onStoreQRCodeGenerate: () => void;
}

const ProductsHeader = ({ onStoreQRCodeGenerate }: ProductsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">My Products</h2>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onStoreQRCodeGenerate}
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
  );
};

export default ProductsHeader;
