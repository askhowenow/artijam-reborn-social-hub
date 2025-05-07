
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStream } from '@/hooks/use-streams';
import StreamPlayer from '@/components/streams/StreamPlayer';
import StreamChat from '@/components/streams/StreamChat';
import { Button } from '@/components/ui/button';
import { Share2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

const StreamDetailPage = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const { data: stream, isLoading, error } = useStream(streamId);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load stream');
    }
  }, [error]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || 'Live Stream',
        text: `Check out this live stream: ${stream?.title}`,
        url: window.location.href
      }).catch(() => {
        // Copy to clipboard fallback
        navigator.clipboard.writeText(window.location.href);
        toast.success('Stream link copied to clipboard');
      });
    } else {
      // Copy to clipboard fallback
      navigator.clipboard.writeText(window.location.href);
      toast.success('Stream link copied to clipboard');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md" />
        <div className="aspect-video bg-gray-200 animate-pulse rounded-md" />
      </div>
    );
  }
  
  if (!stream) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Stream not found</h2>
          <p className="text-gray-500 mt-2">
            The stream you're looking for might have ended or doesn't exist
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow space-y-4">
          {/* Stream title and info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{stream.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {stream.status === 'live' ? (
                  <Badge className="bg-red-600">LIVE</Badge>
                ) : (
                  <Badge variant="outline">
                    {stream.status === 'ended' ? 'Ended' : 'Offline'}
                  </Badge>
                )}
                
                {stream.status === 'live' && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {stream.viewerCount} watching
                  </div>
                )}
                
                {stream.startedAt && (
                  <span className="text-sm text-gray-500">
                    Started {format(new Date(stream.startedAt), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          {/* Stream video player */}
          <StreamPlayer stream={stream} isLoading={false} />
          
          {/* Streamer info */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={stream.user?.avatarUrl || ''} />
                <AvatarFallback>
                  {stream.user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{stream.user?.username || 'Anonymous'}</h3>
                <p className="text-sm text-gray-500">{stream.user?.fullName}</p>
              </div>
            </div>
            
            <Button>Follow</Button>
          </div>
          
          {/* Stream description */}
          {stream.description && (
            <div className="text-sm">
              <h3 className="font-semibold mb-2">About this stream</h3>
              <p className="whitespace-pre-wrap">{stream.description}</p>
            </div>
          )}
        </div>
        
        {/* Chat section */}
        <div className="md:w-80">
          <StreamChat streamId={stream.id} />
        </div>
      </div>
    </div>
  );
};

export default StreamDetailPage;
