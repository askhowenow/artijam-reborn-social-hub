
import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  url: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ url }) => {
  return (
    <div className="border p-4 rounded-lg mb-4 bg-white">
      <QRCodeSVG
        id="vendor-qr-code"
        value={url}
        size={200}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default QRDisplay;
