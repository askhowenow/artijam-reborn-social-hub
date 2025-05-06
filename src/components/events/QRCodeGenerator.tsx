
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeGeneratorProps {
  ticketId: string;
  eventName: string;
  attendeeName?: string;
  attendeeEmail?: string;
  onSendEmail: (email: string) => Promise<void>;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  ticketId,
  eventName,
  attendeeName,
  attendeeEmail,
  onSendEmail,
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState(attendeeEmail || "");
  const [isSending, setIsSending] = useState(false);
  
  // QR code data contains a verified ticket identifier
  const qrCodeData = `ticket:${ticketId}`;
  
  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      await onSendEmail(email);
      toast({
        title: "Success",
        description: "Ticket sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send ticket",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleDownload = () => {
    // Convert SVG to canvas for download
    const svg = document.getElementById("ticket-qr-code");
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
      downloadLink.download = `ticket-${ticketId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    };
    
    img.src = url;
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(qrCodeData).then(() => {
      toast({
        title: "Success",
        description: "Ticket code copied to clipboard",
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket QR Code</CardTitle>
        <CardDescription>
          This QR code provides access to the event. Please keep it secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="border p-4 rounded-lg mb-4 bg-white">
          <QRCodeSVG
            id="ticket-qr-code"
            value={qrCodeData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-medium">{eventName}</h3>
          {attendeeName && <p className="text-sm text-gray-500">Attendee: {attendeeName}</p>}
          <p className="text-xs text-gray-400 mt-1">Ticket ID: {ticketId}</p>
        </div>
        
        <div className="w-full space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">Send ticket to email</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
              >
                <Mail className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Code
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator;
