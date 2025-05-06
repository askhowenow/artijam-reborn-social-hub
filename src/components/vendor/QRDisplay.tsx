
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface QRDisplayProps {
  url: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ url }) => {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied to clipboard"))
      .catch(err => toast.error("Failed to copy URL"));
  };

  return (
    <div className="flex flex-col items-center">
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
        <div className="text-sm overflow-hidden text-ellipsis mb-2 p-2 bg-gray-50 rounded border">
          {url}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={handleCopyUrl}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy URL
        </Button>
      </div>
    </div>
  );
};

export default QRDisplay;
