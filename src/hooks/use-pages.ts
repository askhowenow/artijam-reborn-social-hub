
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { Page, CreatePageInput, UpdatePageInput } from '@/types/page';

export function usePages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSlugValid, setIsSlugValid] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const getUserPages = async (): Promise<Page[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as Page[];
  };

  const getPageBySlug = async (slug: string): Promise<Page | null> => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No page found
      }
      throw error;
    }
    
    return data as Page;
  };

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    setIsCheckingSlug(true);
    try {
      const { data } = await supabase
        .from('pages')
        .select('slug')
        .eq('slug', slug)
        .single();
      
      const isAvailable = !data;
      setIsSlugValid(isAvailable);
      return isAvailable;
    } catch (error) {
      // If error is "no rows returned", that means slug is available
      if ((error as any)?.code === 'PGRST116') {
        setIsSlugValid(true);
        return true;
      }
      setIsSlugValid(false);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const createPage = async (page: CreatePageInput): Promise<Page> => {
    if (!user) throw new Error('User must be logged in');
    
    const { data, error } = await supabase
      .from('pages')
      .insert([{
        ...page,
        user_id: user.id,
      }])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as Page;
  };

  const updatePage = async ({ id, ...updates }: UpdatePageInput & { id: string }): Promise<Page> => {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as Page;
  };

  const deletePage = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
  };

  // Query hooks
  const userPagesQuery = useQuery({
    queryKey: ['pages', user?.id],
    queryFn: getUserPages,
    enabled: !!user,
  });

  const pageBySlugQuery = (slug: string) => useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug),
    enabled: !!slug,
  });

  // Mutation hooks
  const createPageMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Success',
        description: 'Page created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to create page',
        variant: 'destructive',
      });
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: updatePage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.slug] });
      toast({
        title: 'Success',
        description: 'Page updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update page',
        variant: 'destructive',
      });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete page',
        variant: 'destructive',
      });
    }
  });

  return {
    // Queries
    pages: userPagesQuery.data || [],
    isLoading: userPagesQuery.isLoading,
    isError: userPagesQuery.isError,
    pageBySlugQuery,
    
    // Mutations
    createPage: (pageData: CreatePageInput) => createPageMutation.mutateAsync(pageData),
    updatePage: updatePageMutation.mutate,
    deletePage: deletePageMutation.mutate,
    
    // Slug validation
    isSlugValid,
    isCheckingSlug,
    checkSlugAvailability,
  };
}
