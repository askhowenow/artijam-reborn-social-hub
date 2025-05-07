
import React, { useState } from 'react';
import { useLiveStreams } from '@/hooks/use-streams';
import StreamCard from '@/components/streams/StreamCard';
import { Button } from '@/components/ui/button';
import { VideoIcon, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthProvider';

const StreamsPage = () => {
  const { user } = useAuth();
  const { data: streams = [], isLoading } = useLiveStreams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStreams = streams.filter(stream => 
    stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Streams</h1>
          <p className="text-gray-500 mt-1">Watch creators streaming live right now</p>
        </div>
        
        {user && (
          <Link to="/streams/new">
            <Button>
              <VideoIcon className="mr-2 h-4 w-4" />
              Go Live
            </Button>
          </Link>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search streams or creators..."
          className="pl-10 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-video bg-gray-200 animate-pulse rounded-md" />
          ))}
        </div>
      ) : filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              id={stream.id}
              title={stream.title}
              thumbnailUrl={stream.thumbnailUrl}
              viewerCount={stream.viewerCount}
              username={stream.user?.username || 'Anonymous'}
              userAvatar={stream.user?.avatarUrl}
              status={stream.status as 'live' | 'offline' | 'ended'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No streams found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm 
              ? "No streams match your search criteria" 
              : "There are no live streams at the moment"}
          </p>
          {user && searchTerm === '' && (
            <Link to="/streams/new">
              <Button className="mt-4">
                Start your own stream
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamsPage;
