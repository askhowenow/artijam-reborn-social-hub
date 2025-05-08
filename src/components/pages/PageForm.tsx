
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SlugInput from "./SlugInput";

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
        
        <SlugInput 
          slug={slug} 
          onChange={onSlugChange} 
          autoSlug={autoSlug}
        />
        
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

      <div className="mt-4">
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
