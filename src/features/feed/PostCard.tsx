
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLike } from "@/hooks/use-like";
import { format } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    createdAt: string;
    liked: boolean;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = React.useState(post.liked);
  const [likeCount, setLikeCount] = React.useState(post.likes);
  const { like, unlike, isLoading } = useLike();

  const handleLike = () => {
    if (isLoading) return;
    
    if (liked) {
      unlike(post.id);
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      like(post.id);
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <Card className="mb-4 overflow-hidden animate-fade-in">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.author.id}`}>
            <Avatar className="h-10 w-10">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            </Avatar>
          </Link>
          <div>
            <Link
              to={`/profile/${post.author.id}`}
              className="text-sm font-medium hover:underline"
            >
              {post.author.name}
            </Link>
            <p className="text-xs text-gray-500">{post.createdAt}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <MoreHorizontal size={16} />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm mb-3">{post.content}</p>
        {post.image && (
          <div className="aspect-video rounded-md overflow-hidden bg-gray-100 mb-3">
            <img
              src={post.image}
              alt="Post"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 border-t flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1"
          onClick={handleLike}
          disabled={isLoading}
        >
          <Heart
            size={18}
            className={cn(liked ? "fill-red-500 text-red-500" : "text-gray-500")}
          />
          <span>{likeCount}</span>
        </Button>
        <Link to={`/post/${post.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <MessageSquare size={18} className="text-gray-500" />
            <span>{post.comments}</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1"
        >
          <Share2 size={18} className="text-gray-500" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
