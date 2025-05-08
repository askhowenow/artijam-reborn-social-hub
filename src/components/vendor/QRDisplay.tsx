
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface QRDisplayProps {
  url: string;
  size?: number;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ url, size = 200 }) => {
  const qrCodeRef = useRef<SVGSVGElement>(null);
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied to clipboard"))
      .catch(err => toast.error("Failed to copy URL"));
  };
  
  const handleDownloadQR = () => {
    try {
      if (!qrCodeRef.current) {
        toast.error("QR code not available for download");
        return;
      }
      
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const svgString = new XMLSerializer().serializeToString(qrCodeRef.current);
      
      // Set canvas dimensions
      canvas.width = 1000;
      canvas.height = 1000;
      
      // Create an image element with the SVG data
      const image = new Image();
      image.onload = () => {
        // Draw white background
        if (context) {
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image centered on the canvas
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          
          // Create a download link
          const link = document.createElement("a");
          link.download = "qr-code.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
          
          toast.success("QR code downloaded");
        }
      };
      
      image.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border p-4 rounded-lg mb-4 bg-white">
        <QRCodeSVG
          id="vendor-qr-code"
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          ref={qrCodeRef}
        />
      </div>
      
      <div className="w-full space-y-2">
        <div className="text-sm overflow-hidden text-ellipsis p-2 bg-gray-50 rounded border">
          {url}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleCopyUrl}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy URL
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleDownloadQR}
          >
            <Download className="mr-2 h-4 w-4" /> Download QR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
