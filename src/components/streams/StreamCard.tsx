
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface StreamCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  viewerCount: number;
  username: string;
  userAvatar?: string | null;
  status: 'live' | 'offline' | 'ended';
}

const StreamCard: React.FC<StreamCardProps> = ({
  id,
  title,
  thumbnailUrl,
  viewerCount,
  username,
  userAvatar,
  status
}) => {
  return (
    <Link to={`/streams/${id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-lg font-bold text-gray-400 truncate px-4">{title}</span>
              </div>
            )}
          </div>
          
          {status === 'live' && (
            <Badge className="absolute top-2 left-2 bg-red-600">
              LIVE
            </Badge>
          )}
          
          {viewerCount > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {viewerCount}
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium line-clamp-1">{title}</h3>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={userAvatar || ''} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{username}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StreamCard;
