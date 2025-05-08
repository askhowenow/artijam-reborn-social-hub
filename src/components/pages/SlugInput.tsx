
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SlugInputProps {
  slug: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoSlug?: boolean;
}

const SlugInput: React.FC<SlugInputProps> = ({ 
  slug, 
  onChange, 
  autoSlug = false 
}) => {
  return (
    <div>
      <Label htmlFor="slug">URL Slug</Label>
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          @/
        </span>
        <Input
          id="slug"
          className="rounded-l-none"
          placeholder="my-awesome-page"
          value={slug}
          onChange={onChange}
        />
      </div>
      {autoSlug && (
        <p className="text-xs text-gray-500 mt-1">
          The URL slug is automatically generated from the title.
        </p>
      )}
    </div>
  );
};

export default SlugInput;
