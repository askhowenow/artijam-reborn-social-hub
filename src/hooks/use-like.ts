
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/supabase';

export function useLike() {
  const queryClient = useQueryClient();

  const likePost = async (postId: string) => {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: currentUser.id,
        post_id: postId,
      });
    
    if (error) {
      console.error('Error liking post:', error);
      throw error;
    }
    
    return true;
  };

  const unlikePost = async (postId: string) => {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('post_id', postId);
    
    if (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
    
    return true;
  };

  const likeMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error) => {
      console.error('Failed to like post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error) => {
      console.error('Failed to unlike post:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlike post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  };
}
