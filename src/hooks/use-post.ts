
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/supabase';

export function usePost(postId: string) {
  const fetchPost = async () => {
    if (!postId) return null;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, avatar_url, full_name, username),
        likes (id, user_id),
        comments:comments (
          id, 
          content, 
          created_at,
          profiles:user_id (id, avatar_url, full_name, username)
        )
      `)
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
    
    // Get current user to check if post is liked
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id;
    
    // Format post data
    return {
      id: data.id,
      content: data.content,
      image: data.image_url,
      createdAt: new Date(data.created_at).toLocaleString(),
      author: {
        id: data.profiles.id,
        name: data.profiles.full_name || data.profiles.username || 'Anonymous User',
        avatar: data.profiles.avatar_url || '/placeholder.svg',
      },
      likes: data.likes ? data.likes.length : 0,
      comments: data.comments ? data.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at).toLocaleString(),
        author: {
          id: comment.profiles.id,
          name: comment.profiles.full_name || comment.profiles.username || 'Anonymous User',
          avatar: comment.profiles.avatar_url || '/placeholder.svg',
        }
      })) : [],
      liked: data.likes ? data.likes.some(like => like.user_id === currentUserId) : false,
    };
  };

  return useQuery({
    queryKey: ['post', postId],
    queryFn: fetchPost,
    enabled: !!postId,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post details. Please try again later.',
          variant: 'destructive',
        });
      }
    }
  });
}
