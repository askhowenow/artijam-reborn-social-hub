
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/supabase';

export function useUsers(searchQuery = '') {
  const fetchUsers = async () => {
    const currentUser = await getCurrentUser();
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        followers!following_id (follower_id)
      `);
      
    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data.map(user => {
      // Check if current user follows this user
      const isFollowing = currentUser && user.followers 
        ? user.followers.some(follow => follow.follower_id === currentUser.id)
        : false;
        
      return {
        id: user.id,
        name: user.full_name || '',
        username: user.username ? `@${user.username}` : '',
        avatar: user.avatar_url || '/placeholder.svg',
        bio: user.bio || '',
        isFollowing,
        isCurrentUser: currentUser ? user.id === currentUser.id : false
      };
    });
  };

  return useQuery({
    queryKey: ['users', searchQuery],
    queryFn: fetchUsers,
    onError: (error) => {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again later.',
        variant: 'destructive',
      });
    },
  });
}
