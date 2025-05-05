
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useFollow } from "@/hooks/use-follow";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  const { data: users, isLoading, error } = useUsers(debouncedSearch);
  const { follow, unfollow, isLoading: followLoading } = useFollow();

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleFollow = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollow(userId);
    } else {
      follow(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">People</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Failed to load users. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">People</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search people..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <img src={user.avatar} alt={user.name} />
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || user.username}</p>
                      <p className="text-sm text-gray-500">{user.username}</p>
                      <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
                    </div>
                  </Link>
                  {!user.isCurrentUser && (
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollow(user.id, user.isFollowing)}
                      disabled={followLoading}
                      className={user.isFollowing ? "" : "bg-artijam-purple hover:bg-artijam-purple-dark"}
                    >
                      {followLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        user.isFollowing ? "Following" : "Follow"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium mb-2">No Users Found</h3>
            <p className="text-gray-500">
              {debouncedSearch ? "No users match your search criteria." : "No users found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeoplePage;
