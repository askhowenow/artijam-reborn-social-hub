
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface QRCodeActionsProps {
  url: string;
  businessName: string;
  productName?: string;
  qrCodeTitle: string;
  qrDescription: string;
}

const QRCodeActions: React.FC<QRCodeActionsProps> = ({ 
  url, 
  businessName, 
  productName, 
  qrCodeTitle,
  qrDescription 
}) => {
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
    const blobUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = productName 
        ? `${businessName}-${productName}-qr-code.png`
        : `${businessName}-store-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("QR code downloaded successfully");
    };
    
    img.src = blobUrl;
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
    <div className="flex justify-between">
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
    </div>
  );
};

export default QRCodeActions;
