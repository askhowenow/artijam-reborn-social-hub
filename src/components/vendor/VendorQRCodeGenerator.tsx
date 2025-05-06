
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Share2, ExternalLink } from "lucide-react";

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
  
  const handleDownload = () => {
    // Convert SVG to canvas for download
    const svg = document.getElementById("vendor-qr-code");
    if (!svg) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = productId 
        ? `${businessName}-${productName}-qr-code.png`
        : `${businessName}-store-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      toast.success("QR code downloaded successfully");
    };
    
    img.src = url;
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: qrCodeTitle,
          text: qrDescription,
          url: url,
        });
        toast.success("Shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback to copying URL if sharing fails
        handleCopy();
      }
    } else {
      // Fallback for browsers that don't support sharing
      handleCopy();
    }
  };
  
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>{qrCodeTitle}</CardTitle>
        <CardDescription>
          {qrDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="border p-4 rounded-lg mb-4 bg-white">
          <QRCodeSVG
            id="vendor-qr-code"
            value={url}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="w-full">
          <div className="flex flex-col space-y-1.5 mb-4">
            <Label htmlFor="store-url">Store URL</Label>
            <div className="flex space-x-2">
              <Input
                id="store-url"
                value={url}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="secondary" onClick={() => window.open(url, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VendorQRCodeGenerator;
