import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, ExternalLink, MapPin, Calendar, Loader2, PenSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useFollow } from "@/hooks/use-follow";
import PostCard from "@/features/feed/PostCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useUserProfile(userId);
  const { follow, unfollow, isLoading: followLoading } = useFollow();

  // Check auth on component mount - fix the Promise handling here
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch user posts - fix the Promise handling for post.likes
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, avatar_url, full_name, username),
          likes (id, user_id),
          comments:comments (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get current user to check if posts are liked
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      
      return data.map((post) => ({
        id: post.id,
        content: post.content,
        image: post.image_url,
        createdAt: new Date(post.created_at).toLocaleString(),
        author: {
          id: post.profiles.id,
          name: post.profiles.full_name || post.profiles.username || 'Anonymous User',
          avatar: post.profiles.avatar_url || '/placeholder.svg',
        },
        likes: post.likes ? post.likes.length : 0,
        comments: post.comments ? post.comments.length : 0,
        liked: post.likes ? post.likes.some(like => like.user_id === currentUserId) : false,
      }));
    },
    enabled: !!userId,
  });

  const handleFollowAction = () => {
    if (!profile) return;
    
    if (profile.isFollowing) {
      unfollow(profile.id);
    } else {
      follow(profile.id);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Profile not found or there was an error loading the profile.
        </div>
        <Button onClick={() => navigate("/")} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <img src={profile.avatar} alt={profile.fullName} />
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              <p className="text-gray-500">{profile.username}</p>
              
              <p className="mt-2 text-gray-700">{profile.bio}</p>
              
              {profile.website && (
                <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-blue-600">
                  <ExternalLink size={16} className="mr-1" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                </div>
              )}
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <div>
                  <span className="font-semibold">{profile.followersCount}</span>
                  <span className="text-gray-500 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold">{profile.followingCount}</span>
                  <span className="text-gray-500 ml-1">Following</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {profile.isCurrentUser ? (
                <Button onClick={() => navigate("/profile/edit")}>
                  <PenSquare size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant={profile.isFollowing ? "outline" : "default"}
                  onClick={handleFollowAction}
                  disabled={followLoading}
                >
                  {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (profile.isFollowing ? "Following" : "Follow")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Content */}
      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {postsLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-4">
                {profile.isCurrentUser 
                  ? "Your posts will appear here when you create them."
                  : "This user hasn't posted anything yet."}
              </p>
              {profile.isCurrentUser && (
                <Button onClick={() => navigate("/post/create")}>Create a Post</Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="media">
          <div className="bg-white rounded-md p-8 text-center shadow">
            <h3 className="text-lg font-medium mb-2">Media Gallery</h3>
            <p className="text-gray-500">
              This feature is coming soon!
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="liked">
          <div className="bg-white rounded-md p-8 text-center shadow">
            <h3 className="text-lg font-medium mb-2">Liked Posts</h3>
            <p className="text-gray-500">
              This feature is coming soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
