
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode } from "lucide-react";
import SlugInput from "./SlugInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PageFormProps {
  title: string;
  slug: string;
  content: string;
  published: boolean;
  isSaving: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPublishedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  autoSlug: boolean;
}

const PageForm: React.FC<PageFormProps> = ({
  title,
  slug,
  content,
  published,
  isSaving,
  onTitleChange,
  onSlugChange,
  onContentChange,
  onPublishedChange,
  onSave,
  autoSlug,
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Generate the storefront URL in the format artijam.biz/<slug>
  const storefrontUrl = `https://artijam.biz/${slug}`;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col space-y-4">
        <div>
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            placeholder="My Awesome Page"
            value={title}
            onChange={onTitleChange}
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label>Page URL</Label>
          <div className="flex items-center">
            <div className="bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 text-gray-500 text-sm">
              artijam.biz/
            </div>
            <Input
              id="slug"
              placeholder="my-awesome-page"
              value={slug}
              onChange={onSlugChange}
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-gray-500">
            This will be your public storefront URL: {storefrontUrl}
          </p>
          
          {slug && (
            <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit mt-2"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>QR Code for your page</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <QRCodeGenerator 
                    url={storefrontUrl} 
                    title={title || 'My Artijam Page'}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            id="published"
            className="w-4 h-4"
            checked={published}
            onChange={onPublishedChange}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <div className="flex-1 mt-4">
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content"
          className="min-h-[300px] p-4 w-full"
          placeholder="Type your content here..."
          value={content}
          onChange={onContentChange}
        />
      </div>

      <div className="mt-4 flex justify-between">
        <div>
          {slug && (
            <p className="text-sm text-gray-500">
              Your page will be available at:{" "}
              <a 
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-artijam-purple hover:underline"
              >
                {storefrontUrl}
              </a>
            </p>
          )}
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Page"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PageForm;
