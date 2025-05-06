
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface URLDisplayProps {
  url: string;
}

const URLDisplay: React.FC<URLDisplayProps> = ({ url }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
    });
  };
  
  return (
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
  );
};

export default URLDisplay;
