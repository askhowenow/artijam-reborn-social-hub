
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

// Mock users data
const users = [
  {
    id: "1",
    name: "Emma Watson",
    username: "@emmaw",
    avatar: "/placeholder.svg",
    bio: "Digital artist and designer",
    isFollowing: false,
  },
  {
    id: "2",
    name: "John Smith",
    username: "@johnsmith",
    avatar: "/placeholder.svg",
    bio: "Professional photographer and educator",
    isFollowing: true,
  },
  {
    id: "3",
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/placeholder.svg",
    bio: "UX designer and front-end developer",
    isFollowing: false,
  },
  {
    id: "4",
    name: "Michael Chen",
    username: "@mikechen",
    avatar: "/placeholder.svg",
    bio: "Content creator and marketing expert",
    isFollowing: false,
  },
  {
    id: "5",
    name: "Aisha Patel",
    username: "@aishap",
    avatar: "/placeholder.svg",
    bio: "Freelance illustrator and course creator",
    isFollowing: true,
  },
  {
    id: "6",
    name: "Robert Williams",
    username: "@robwill",
    avatar: "/placeholder.svg",
    bio: "Entrepreneur and business consultant",
    isFollowing: false,
  },
];

const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [followState, setFollowState] = React.useState<Record<string, boolean>>(
    users.reduce((acc, user) => ({ ...acc, [user.id]: user.isFollowing }), {})
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = (userId: string) => {
    setFollowState({
      ...followState,
      [userId]: !followState[userId],
    });
  };

  return (
    <div className="container max-w-4xl mx-auto">
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
        {filteredUsers.map((user) => (
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
                    <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
                  </div>
                </Link>
                <Button
                  variant={followState[user.id] ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleFollow(user.id)}
                  className={followState[user.id] ? "" : "bg-artijam-purple hover:bg-artijam-purple-dark"}
                >
                  {followState[user.id] ? "Following" : "Follow"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PeoplePage;
