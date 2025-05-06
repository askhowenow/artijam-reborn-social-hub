
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QRDisplay from "./QRDisplay";
import URLDisplay from "./URLDisplay";
import QRCodeActions from "./QRCodeActions";

interface VendorQRCodeGeneratorProps {
  storeSlug: string;
  productId?: string;
  businessName: string;
  productName?: string;
  onClose?: () => void;
}

const VendorQRCodeGenerator: React.FC<VendorQRCodeGeneratorProps> = ({
  storeSlug,
  productId,
  businessName,
  productName,
  onClose,
}) => {
  const baseUrl = window.location.origin;
  
  // Generate URL for either the entire store or a specific product
  const url = productId 
    ? `${baseUrl}/store/@${storeSlug}/product/${productId}`
    : `${baseUrl}/store/@${storeSlug}`;
  
  const qrCodeTitle = productId
    ? `QR Code for ${productName}`
    : `Store QR Code for ${businessName}`;
    
  const qrDescription = productId
    ? `Scan this QR code to view ${productName} in the ${businessName} store.`
    : `Scan this QR code to visit the ${businessName} store.`;
  
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>{qrCodeTitle}</CardTitle>
        <CardDescription>
          {qrDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <QRDisplay url={url} />
        <URLDisplay url={url} />
      </CardContent>
      <CardFooter>
        <QRCodeActions 
          url={url}
          businessName={businessName}
          productName={productName}
          qrCodeTitle={qrCodeTitle}
          qrDescription={qrDescription}
        />
      </CardFooter>
    </Card>
  );
};

export default VendorQRCodeGenerator;
