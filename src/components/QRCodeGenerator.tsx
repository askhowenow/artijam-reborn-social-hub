
import React from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
  showShare?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url,
  size = 200,
  title,
  showDownload = true,
  showShare = true,
}) => {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `artijam-qrcode-${new Date().getTime()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Artijam QR Code',
          text: 'Scan this QR code to visit my page',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
      } catch (err) {
        console.error('Could not copy text:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border p-4 rounded-lg bg-white">
        <QRCode 
          id="qr-code"
          value={url} 
          size={size} 
          level="H"
          includeMargin={true}
          renderAs="canvas"
        />
      </div>
      
      {title && <p className="mt-2 text-sm text-center">{title}</p>}
      
      <div className="flex gap-3 mt-4">
        {showDownload && (
          <Button variant="outline" size="sm" onClick={downloadQR}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
        {showShare && (
          <Button variant="outline" size="sm" onClick={shareQR}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
