
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Loader2, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/features/feed/PostCard";
import { useFollow } from "@/hooks/use-follow";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialTab = searchParams.get("tab") || "posts";
  
  const [query, setQuery] = useState(initialQuery || initialTag);
  const [tab, setTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { follow, unfollow } = useFollow();
  
  // User follow states
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  
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

  // Set up initial search if tag or query is provided in URL
  useEffect(() => {
    if (initialQuery || initialTag) {
      performSearch();
    }
  }, [initialQuery, initialTag]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Get current user for checking if following users
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      
      // Search for posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, avatar_url, full_name, username),
          likes (id, user_id),
          comments:comments (id)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      // Format posts data
      const formattedPosts = postsData.map(post => ({
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
      
      setPosts(formattedPosts);
      
      // Search for users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          followers!following_id (follower_id)
        `)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`);
        
      if (usersError) throw usersError;
      
      // Format users data and track follow state
      const formattedUsers = usersData.map(user => {
        const isFollowing = currentUserId && user.followers 
          ? user.followers.some((follow: {follower_id: string}) => follow.follower_id === currentUserId)
          : false;
          
        return {
          id: user.id,
          name: user.full_name || user.username || 'Anonymous',
          username: user.username ? `@${user.username}` : '',
          avatar: user.avatar_url || '/placeholder.svg',
          bio: user.bio || '',
          isCurrentUser: currentUserId === user.id,
          isFollowing,
        };
      });
      
      setUsers(formattedUsers);
      
      // Set follow states
      const initialFollowStates: Record<string, boolean> = {};
      formattedUsers.forEach(user => {
        if (!user.isCurrentUser) {
          initialFollowStates[user.id] = user.isFollowing;
        }
      });
      setFollowStates(initialFollowStates);
      
      // Update URL with search params
      setSearchParams({ q: query, tab });
      
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleTabChange = (value: string) => {
    setTab(value);
    setSearchParams({ q: query, tab: value });
  };

  const handleFollow = (userId: string) => {
    if (followStates[userId]) {
      unfollow(userId);
      setFollowStates(prev => ({ ...prev, [userId]: false }));
    } else {
      follow(userId);
      setFollowStates(prev => ({ ...prev, [userId]: true }));
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <form onSubmit={handleSearch} className="mb-6 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search posts, people, topics..."
          className="pl-10 pr-28"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2"
          size="sm"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
      
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText size={16} />
            <span>Posts</span>
            {posts.length > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{posts.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users size={16} />
            <span>People</span>
            {users.length > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{users.length}</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
              <p className="mt-2 text-gray-500">Searching posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : query ? (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-500">
                We couldn't find any posts matching "{query}"
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">Search for posts</h3>
              <p className="text-gray-500">
                Enter keywords above to find posts
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="people">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
              <p className="mt-2 text-gray-500">Searching people...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <img src={user.avatar} alt={user.name} />
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.username}</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{user.bio}</p>
                        </div>
                      </Link>
                      {!user.isCurrentUser && (
                        <Button
                          variant={followStates[user.id] ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollow(user.id)}
                          className={followStates[user.id] ? "" : "bg-artijam-purple hover:bg-artijam-purple-dark"}
                        >
                          {followStates[user.id] ? "Following" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query ? (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-500">
                We couldn't find any people matching "{query}"
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md p-8 text-center shadow">
              <h3 className="text-lg font-medium mb-2">Search for people</h3>
              <p className="text-gray-500">
                Enter keywords above to find people
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;
