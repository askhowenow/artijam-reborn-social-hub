
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenSquare, Trash2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean | null;
};

interface ProductCardProps {
  product: Product;
  onQRCodeGenerate: (product: Product) => void;
}

const ProductCard = ({ product, onQRCodeGenerate }: ProductCardProps) => {
  const navigate = useNavigate();
  
  return (
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
                onClick={() => onQRCodeGenerate(product)}
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
  );
};

export default ProductCard;
