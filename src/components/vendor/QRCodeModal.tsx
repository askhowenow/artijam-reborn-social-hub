
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QRDisplay from './QRDisplay';
import QRCodeActions from './QRCodeActions';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSlug: string;
  businessName: string;
  subdomainUrl?: string | null;
  productName?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onOpenChange,
  storeSlug,
  businessName,
  subdomainUrl = null,
  productName
}) => {
  const [activeTab, setActiveTab] = useState<string>(subdomainUrl ? "subdomain" : "path");
  const pathUrl = `https://artijam.com/@${storeSlug}`;
  const url = activeTab === "subdomain" && subdomainUrl ? subdomainUrl : pathUrl;
  const qrCodeTitle = productName 
    ? `${businessName} - ${productName}`
    : `${businessName} Store`;
  const qrDescription = productName
    ? `Check out ${productName} at ${businessName}`
    : `Visit ${businessName} store`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">
            {businessName} QR Code
          </DialogTitle>
        </DialogHeader>
        
        {subdomainUrl && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="path">Standard URL</TabsTrigger>
              <TabsTrigger value="subdomain">Subdomain URL</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <div className="flex flex-col items-center gap-4">
          <QRDisplay url={url} />
          
          <div className="text-center max-w-[300px] mx-auto">
            <p className="font-medium mb-1 break-all text-sm">
              {url}
            </p>
            <p className="text-sm text-gray-500">
              Scan this QR code to visit the store
            </p>
          </div>
          
          <QRCodeActions 
            url={url} 
            businessName={businessName} 
            productName={productName}
            qrCodeTitle={qrCodeTitle}
            qrDescription={qrDescription}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
