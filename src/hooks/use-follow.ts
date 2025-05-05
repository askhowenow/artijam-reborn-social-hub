
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/supabase';

export function useFollow() {
  const queryClient = useQueryClient();

  const followUser = async (userId: string) => {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: currentUser.id,
        following_id: userId,
      });
    
    if (error) {
      console.error('Error following user:', error);
      throw error;
    }
    
    return true;
  };

  const unfollowUser = async (userId: string) => {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId);
    
    if (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
    
    return true;
  };

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({
        title: 'Success',
        description: 'You are now following this user.',
      });
    },
    onError: (error) => {
      console.error('Failed to follow user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({
        title: 'Success',
        description: 'You have unfollowed this user.',
      });
    },
    onError: (error) => {
      console.error('Failed to unfollow user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}
