
import React, { useState, useRef, useEffect } from 'react';
import { useStreamChat } from '@/hooks/use-stream-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthProvider';

interface StreamChatProps {
  streamId: string;
  className?: string;
}

const StreamChat: React.FC<StreamChatProps> = ({ streamId, className }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useStreamChat(streamId);
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages.length]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;
    
    try {
      await sendMessage.mutateAsync(messageText);
      setMessageText('');
      // Focus back on input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className={`h-[500px] flex flex-col ${className || ''}`}>
      <CardHeader className="py-2 px-4 border-b">
        <h3 className="text-sm font-medium">Live Chat</h3>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 relative">
        <ScrollArea ref={scrollAreaRef} className="h-[390px] p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No messages yet. Be the first to say something!
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={msg.user?.avatarUrl || ''} />
                  <AvatarFallback>
                    {msg.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold">
                      {msg.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-2 border-t">
        {user ? (
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Send a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              maxLength={200}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={sendMessage.isPending || !messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="w-full text-center text-sm text-gray-500">
            You need to be logged in to chat
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default StreamChat;
