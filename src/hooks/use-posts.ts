
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function usePosts() {
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, avatar_url, full_name, username),
        likes (id, user_id),
        comments:comments (id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    // Transform data to include counts and format for the UI
    return data.map((post) => {
      const likesCount = post.likes ? post.likes.length : 0;
      const commentsCount = post.comments ? post.comments.length : 0;
      
      return {
        id: post.id,
        content: post.content,
        image: post.image_url,
        createdAt: new Date(post.created_at).toLocaleString(),
        author: {
          id: post.profiles.id,
          name: post.profiles.full_name || post.profiles.username || 'Anonymous User',
          avatar: post.profiles.avatar_url || '/placeholder.svg',
        },
        likes: likesCount,
        comments: commentsCount,
        liked: post.likes ? post.likes.some(like => like.user_id === supabase.auth.getSession()?.user?.id) : false,
      };
    });
  };

  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    onError: (error) => {
      console.error('Failed to fetch posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again later.',
        variant: 'destructive',
      });
    },
  });
}
