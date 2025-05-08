
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "@/hooks/use-pages";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import PageForm from "./PageForm";

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublished(e.target.checked);
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
    <PageForm
      title={title}
      slug={slug}
      content={content}
      published={published}
      isSaving={isSaving}
      onTitleChange={handleTitleChange}
      onSlugChange={handleSlugChange}
      onContentChange={handleContentChange}
      onPublishedChange={handlePublishedChange}
      onSave={handleSave}
      autoSlug={autoSlug}
    />
  );
};

export default PageEditor;
