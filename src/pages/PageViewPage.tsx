
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Page } from '@/types/page';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

const PageViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data as Page;
    },
    enabled: !!slug,
  });

  const isOwner = user?.id === page?.user_id;
  const canView = page?.published || isOwner;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="container max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Private Page</h1>
        <p className="text-gray-600 mb-8">
          This page is not published yet and is only visible to its owner.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {isOwner && (
          <Button
            variant="outline"
            onClick={() => navigate(`/page/${page.id}/edit`)}
          >
            Edit Page
          </Button>
        )}
      </div>

      <article className="prose lg:prose-xl max-w-none">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        
        {page.content ? (
          <div className="whitespace-pre-wrap">{page.content}</div>
        ) : (
          <p className="text-gray-500 italic">No content has been added to this page yet.</p>
        )}
      </article>
    </div>
  );
};

export default PageViewPage;
