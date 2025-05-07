
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StreamChat } from '@/types/stream';

export const useStreamChat = (streamId: string | undefined) => {
  const queryClient = useQueryClient();
  const [newMessages, setNewMessages] = useState<StreamChat[]>([]);
  
  // Fetch existing chat messages
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['stream-chat', streamId],
    queryFn: async () => {
      if (!streamId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('stream_chats')
        .select(`
          *,
          profiles:user_id(
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });
        
      if (error) {
        toast.error('Failed to load chat messages');
        throw error;
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        streamId: item.stream_id,
        userId: item.user_id,
        message: item.message,
        createdAt: item.created_at,
        user: {
          username: item.profiles?.username,
          avatarUrl: item.profiles?.avatar_url,
          fullName: item.profiles?.full_name
        }
      }));
    },
    enabled: !!streamId
  });
  
  // Subscribe to new messages
  useEffect(() => {
    if (!streamId) return;
    
    const channel = supabase
      .channel('stream-chat-changes')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'stream_chats',
          filter: `stream_id=eq.${streamId}`
        },
        async (payload) => {
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, avatar_url, full_name')
            .eq('id', payload.new.user_id)
            .single();
            
          const newMessage = {
            id: payload.new.id,
            streamId: payload.new.stream_id,
            userId: payload.new.user_id,
            message: payload.new.message,
            createdAt: payload.new.created_at,
            user: userData ? {
              username: userData.username,
              avatarUrl: userData.avatar_url,
              fullName: userData.full_name
            } : undefined
          };
          
          setNewMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);
  
  // Combine fetched messages with realtime ones
  const allMessages = [...(messages || []), ...newMessages];
  
  // Send a new message
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!streamId) {
        throw new Error('Stream ID is required');
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('You must be logged in to send messages');
      }
      
      const { error } = await supabase
        .from('stream_chats')
        .insert({
          stream_id: streamId,
          user_id: userData.user.id,
          message
        });
        
      if (error) {
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to send message: ${error.message}`);
      }
    }
  });
  
  return {
    messages: allMessages,
    isLoading,
    error,
    sendMessage
  };
};

export default useStreamChat;
