
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "@/hooks/use-pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PageEditorProps {
  isNew?: boolean;
}

const PageEditor: React.FC<PageEditorProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pages, pageBySlugQuery, createPage, updatePage } = usePages();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const page = pages.find((p) => p.id === id);
  const { data: pageData, isLoading: isPageLoading } = pageBySlugQuery(slug);

  useEffect(() => {
    if (!isNew && page) {
      setTitle(page.title);
      setSlug(page.slug);
      setContent(page.content || "");
      setPublished(page.published);
    }
  }, [isNew, page]);

  useEffect(() => {
    if (isNew) {
      setIsLoading(false);
      return;
    }

    if (isPageLoading) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
  }, [isNew, isPageLoading]);

  useEffect(() => {
    if (autoSlug && title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(newSlug);
    }
  }, [title, autoSlug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      if (isNew) {
        if (!title.trim() || !slug.trim()) {
          toast({
            title: "Error",
            description: "Title and Slug cannot be empty.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const newPage = await createPage({
          title: title.trim(),
          slug: slug.trim(),
          content: content,
          published: published,
        });

        toast({
          title: "Success",
          description: "Page created successfully.",
        });

        navigate(`/page/${newPage.id}/edit`);
      } else {
        if (!id) {
          toast({
            title: "Error",
            description: "Page ID is missing.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        await updatePage({
          id: id,
          title: title.trim(),
          slug: slug.trim(),
          content: content,
          published: published,
        });

        toast({
          title: "Success",
          description: "Page updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save page.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [isNew, id, title, slug, content, published, createPage, updatePage, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col space-y-4">
        <div>
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            placeholder="My Awesome Page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
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
                onChange={handleSlugChange}
              />
            </div>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            id="published"
            className="w-4 h-4"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
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
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <Button onClick={handleSave} disabled={isSaving}>
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

export default PageEditor;
