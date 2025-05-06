
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VendorQRCodeGenerator from "./VendorQRCodeGenerator";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSlug: string;
  productId?: string;
  businessName: string;
  productName?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onOpenChange,
  storeSlug,
  productId,
  businessName,
  productName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>QR Code</DialogTitle>
        <DialogDescription>
          Generate a QR code for your {productId ? "product" : "store"}.
          Customers can scan this to directly access your {productId ? "product" : "store"} page.
        </DialogDescription>
        <VendorQRCodeGenerator
          storeSlug={storeSlug}
          productId={productId}
          businessName={businessName}
          productName={productName}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
