
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePages } from '@/hooks/use-pages';
import { debounce } from '@/lib/utils';

interface CreatePageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePageModal: React.FC<CreatePageModalProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPage, isSlugValid, isCheckingSlug, checkSlugAvailability } = usePages();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(newSlug);
    }
  }, [title, autoSlug]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug) return;
    
    const checkSlug = debounce(() => {
      checkSlugAvailability(slug);
    }, 500);
    
    checkSlug();
    
    return () => {
      // Cancel debounce on cleanup
    };
  }, [slug, checkSlugAvailability]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    if (isSlugValid === false) {
      toast({
        title: 'Error',
        description: 'This URL is already taken. Please choose another.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newPage = await createPage({
        title: title.trim(),
        slug: slug.trim(),
        content: '',
        published: false
      });
      
      onOpenChange(false);
      navigate(`/page/${newPage.id}/edit`);
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: 'Error',
        description: 'Failed to create page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Add a new custom page to your profile.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              placeholder="My Awesome Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              <span className="text-xs text-gray-500">
                {isCheckingSlug ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-3 w-3 mr-1" /> Checking...
                  </span>
                ) : isSlugValid === true ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" /> Available
                  </span>
                ) : isSlugValid === false ? (
                  <span className="flex items-center text-red-600">
                    <X className="h-3 w-3 mr-1" /> Already taken
                  </span>
                ) : null}
              </span>
            </div>
            
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
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500">
              Your page will be available at artijam.com/@/{slug || 'your-page-slug'}
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSlugValid === false}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Page'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePageModal;
