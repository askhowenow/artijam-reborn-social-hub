
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePages } from '@/hooks/use-pages';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pages, updatePage, isLoading } = usePages();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Find the page in the loaded pages
  const page = pages.find(p => p.id === id);

  useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
      setContent(page.content || '');
      setIsPublished(page.published || false);
    }
  }, [page]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSave = async () => {
    if (!id) return;
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }
    
    if (!slug.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL slug',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updatePage({
        id,
        title: title.trim(),
        slug: slug.trim(),
        content,
        published: isPublished
      });
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!page && !isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
        <Button 
          variant="default" 
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/profile')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Page</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/@${slug}`)}
            disabled={isSaving}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page Title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              @/
            </span>
            <Input
              id="slug"
              className="rounded-l-none"
              value={slug}
              onChange={handleSlugChange}
              placeholder="page-url-slug"
            />
          </div>
          <p className="text-xs text-gray-500">
            Your page will be available at artijam.com/@/{slug || 'page-url'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your page content here..."
            className="min-h-[300px]"
          />
          <p className="text-xs text-gray-500">
            Simple text content for now. Rich editing will be available soon.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={isPublished}
            onCheckedChange={setIsPublished}
            id="published"
          />
          <Label htmlFor="published">Publish this page</Label>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
