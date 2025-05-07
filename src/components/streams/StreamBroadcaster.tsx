
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateStreamStatus } from '@/hooks/use-streams';
import { Stream } from '@/types/stream';

interface StreamBroadcasterProps {
  stream: Stream;
}

const StreamBroadcaster: React.FC<StreamBroadcasterProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamKey, setStreamKey] = useState<string>(stream.streamKey || '');
  const [isStreaming, setIsStreaming] = useState(stream.status === 'live');
  const updateStreamStatus = useUpdateStreamStatus();
  
  // Function to copy stream key to clipboard
  const handleCopyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast.success('Stream key copied to clipboard');
  };
  
  // Function to start streaming
  const handleStartStreaming = async () => {
    try {
      await updateStreamStatus.mutateAsync({ 
        streamId: stream.id, 
        status: 'live' 
      });
      setIsStreaming(true);
      toast.success('You are now live!');
    } catch (error) {
      toast.error('Failed to go live');
    }
  };
  
  // Function to end streaming
  const handleEndStreaming = async () => {
    try {
      await updateStreamStatus.mutateAsync({ 
        streamId: stream.id, 
        status: 'ended' 
      });
      setIsStreaming(false);
      toast.success('Stream ended');
    } catch (error) {
      toast.error('Failed to end stream');
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Stream Setup</h3>
              <p className="text-sm text-gray-500">
                Use streaming software like OBS Studio to go live.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Stream Key</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyStreamKey}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              
              <div className="flex items-center">
                <Input
                  value={streamKey}
                  readOnly
                  type="password"
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Server URL</label>
              <Input
                value="rtmp://live.example.com/live"
                readOnly
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Use this URL with your stream key in your broadcasting software.
              </p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Stream Preview</h3>
              <div className="bg-gray-900 aspect-video rounded-md flex items-center justify-center">
                {isStreaming ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-md"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Radio className="h-8 w-8 mb-2" />
                    <span>Preview will appear when you start streaming</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                {stream.status === 'live' ? (
                  <Badge className="bg-red-600">LIVE</Badge>
                ) : (
                  <Badge variant="outline">Offline</Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button 
                    onClick={handleStartStreaming} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Go Live
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleEndStreaming}
                  >
                    End Stream
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
        Note: Your stream key is sensitive. Never share it with others.
      </CardFooter>
    </Card>
  );
};

export default StreamBroadcaster;
