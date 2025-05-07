
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stream } from '@/types/stream';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface StreamPlayerProps {
  stream: Stream | undefined;
  isLoading: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

  useEffect(() => {
    if (stream?.playbackUrl && videoRef.current) {
      videoRef.current.src = stream.playbackUrl;
    }
  }, [stream?.playbackUrl]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full aspect-video">
        <CardContent className="p-0">
          <Skeleton className="h-full w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!stream || stream.status !== 'live') {
    return (
      <Card className="w-full aspect-video bg-gray-900">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center text-white">
            {!stream ? 'Stream not found' : 'This stream is currently offline'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0 relative">
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-10"
            onClick={handlePlay}
          >
            <div className="bg-artijam-purple/90 rounded-full p-4">
              <Play className="h-10 w-10 text-white" />
            </div>
          </div>
        )}
        <video 
          ref={videoRef}
          className="w-full aspect-video bg-black"
          controls={isPlaying}
          autoPlay={false}
          muted={isMuted}
          playsInline
        />
        {isPlaying && (
          <div className="absolute bottom-16 right-4 z-20">
            <button 
              className="bg-black/50 p-2 rounded-full"
              onClick={handleToggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreamPlayer;
