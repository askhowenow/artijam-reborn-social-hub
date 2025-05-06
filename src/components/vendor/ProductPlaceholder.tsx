
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductPlaceholderProps {
  message: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
}

const ProductPlaceholder = ({
  message,
  description,
  buttonText,
  buttonAction,
}: ProductPlaceholderProps) => {
  return (
    <div className="bg-white rounded-md p-10 text-center shadow">
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-gray-500 mb-6">
        {description}
      </p>
      <Button 
        onClick={buttonAction}
        className="bg-artijam-purple hover:bg-artijam-purple/90"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  );
};

export default ProductPlaceholder;
