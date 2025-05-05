
import React from "react";
import { useNavigate } from "react-router-dom";
import CreatePostButton from "@/features/feed/CreatePostButton";
import PostCard from "@/features/feed/PostCard";
import SuggestedUsers from "@/features/feed/SuggestedUsers";
import TrendingTopics from "@/features/feed/TrendingTopics";
import { usePosts } from "@/hooks/use-posts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = usePosts();

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h3 className="text-xl font-semibold text-red-500 mb-4">Failed to load posts</h3>
        <p className="text-gray-600 mb-6">There was an error loading your feed</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <CreatePostButton />
          
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
              <Button onClick={() => navigate("/post")}>Create a Post</Button>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block space-y-4">
          <SuggestedUsers />
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
