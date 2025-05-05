
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/supabase';

export function useUserProfile(userId?: string) {
  const fetchUserProfile = async () => {
    // If no userId is provided, get the current user's profile
    let profileId = userId;
    
    if (!profileId) {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      profileId = currentUser.id;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        followers:followers!following_id (count),
        following:followers!follower_id (count)
      `)
      .eq('id', profileId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    // Check if current user is following this profile
    const currentUser = await getCurrentUser();
    let isFollowing = false;
    
    if (currentUser && currentUser.id !== profileId) {
      const { data: followData } = await supabase
        .from('followers')
        .select()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profileId)
        .maybeSingle();
        
      isFollowing = !!followData;
    }
    
    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      avatar: data.avatar_url || '/placeholder.svg',
      bio: data.bio || '',
      website: data.website || '',
      followersCount: data.followers ? data.followers.count : 0,
      followingCount: data.following ? data.following.count : 0,
      isFollowing,
      isCurrentUser: currentUser ? currentUser.id === profileId : false,
    };
  };

  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: fetchUserProfile,
    onError: (error) => {
      console.error('Failed to fetch profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile. Please try again later.',
        variant: 'destructive',
      });
    },
  });
}
