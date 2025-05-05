
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFollow } from "@/hooks/use-follow";

const SuggestedUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { follow, unfollow, isLoading: followLoading } = useFollow();
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const currentUserId = sessionData.session.user.id;
        
        // Get users that the current user is not following
        const { data } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            avatar_url,
            followers!following_id (follower_id)
          `)
          .neq('id', currentUserId)
          .limit(3);
          
        if (data) {
          // Filter out users the current user is already following
          const suggestedUsers = data.filter(user => {
            const isFollowing = user.followers.some(
              (follow: {follower_id: string}) => follow.follower_id === currentUserId
            );
            return !isFollowing;
          }).map(user => ({
            id: user.id,
            name: user.full_name || user.username || 'Anonymous',
            username: user.username ? `@${user.username}` : '',
            avatar: user.avatar_url || '/placeholder.svg',
            isFollowing: false
          }));
          
          setUsers(suggestedUsers);
          
          // Initialize follow states
          const initialFollowStates: Record<string, boolean> = {};
          suggestedUsers.forEach(user => {
            initialFollowStates[user.id] = false;
          });
          setFollowStates(initialFollowStates);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestedUsers();
  }, []);

  const handleFollow = (userId: string) => {
    if (followStates[userId]) {
      unfollow(userId);
      setFollowStates(prev => ({ ...prev, [userId]: false }));
    } else {
      follow(userId);
      setFollowStates(prev => ({ ...prev, [userId]: true }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">People you may know</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-artijam-purple" />
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return null; // Don't show the component if there are no suggestions
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">People you may know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <img src={user.avatar} alt={user.name} />
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
            </Link>
            <Button 
              size="sm" 
              variant={followStates[user.id] ? "outline" : "default"}
              onClick={() => handleFollow(user.id)}
              disabled={followLoading}
            >
              {followStates[user.id] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-artijam-purple" asChild>
          <Link to="/people">See More</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SuggestedUsers;
