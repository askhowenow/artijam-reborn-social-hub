
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLike } from "@/hooks/use-like";
import { usePost } from "@/hooks/use-post";

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { data: post, isLoading, error } = usePost(postId!);
  const { like, unlike } = useLike();
  
  // State for like UI
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Update like state when post data changes
  useEffect(() => {
    if (post) {
      setLiked(post.liked);
      setLikeCount(post.likes);
    }
  }, [post]);
  
  // Check auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLike = () => {
    if (!post) return;
    
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
  
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!postId) throw new Error("Post ID is required");
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          post_id: postId,
          user_id: sessionData.session.user.id
        });
        
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      setComment("");
      setSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      setSubmitting(false);
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmitting(true);
    commentMutation.mutate(comment.trim());
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          Post not found or there was an error loading the post.
        </div>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-6">
      {/* Post Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.createdAt}</p>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="mb-4">
            <p className="text-base mb-4">{post.content}</p>
            {post.image && (
              <div className="rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Post Actions */}
          <div className="flex items-center gap-4 py-2 border-t border-b">
            <button 
              className="flex items-center gap-1 text-sm"
              onClick={handleLike}
            >
              <Heart
                size={18}
                className={cn(liked ? "fill-red-500 text-red-500" : "text-gray-500")}
              />
              <span>{likeCount} likes</span>
            </button>
            <button className="flex items-center gap-1 text-sm">
              <MessageSquare size={18} className="text-gray-500" />
              <span>{post.comments?.length || 0} comments</span>
            </button>
            <button className="flex items-center gap-1 text-sm ml-auto">
              <Share2 size={18} className="text-gray-500" />
              <span>Share</span>
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Comment Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <img src="/placeholder.svg" alt="Your avatar" />
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none mb-2"
                rows={2}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!comment.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-medium">Comments ({post.comments?.length || 0})</h3>
        
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <img src={comment.author.avatar} alt={comment.author.name} />
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{comment.author.name}</p>
                      <span className="text-xs text-gray-500">{comment.createdAt}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
