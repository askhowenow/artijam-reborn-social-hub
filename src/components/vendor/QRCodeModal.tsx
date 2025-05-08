
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
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onOpenChange,
  storeSlug,
  businessName,
  subdomainUrl = null
}) => {
  const [activeTab, setActiveTab] = useState<string>(subdomainUrl ? "subdomain" : "path");
  const pathUrl = `https://artijam.com/@${storeSlug}`;
  const qrValue = activeTab === "subdomain" && subdomainUrl ? subdomainUrl : pathUrl;
  
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
          <QRDisplay value={qrValue} size={200} />
          
          <div className="text-center max-w-[300px] mx-auto">
            <p className="font-medium mb-1 break-all text-sm">
              {activeTab === "subdomain" && subdomainUrl ? subdomainUrl : pathUrl}
            </p>
            <p className="text-sm text-gray-500">
              Scan this QR code to visit the store
            </p>
          </div>
          
          <QRCodeActions qrValue={qrValue} businessName={businessName} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
