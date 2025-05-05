
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock suggested users data
const suggestedUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Michael Chen",
    username: "@mikechen",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Aisha Patel",
    username: "@aishap",
    avatar: "/placeholder.svg",
  },
];

const SuggestedUsers = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">People you may know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((user) => (
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
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-artijam-purple">
          See More
        </Button>
      </CardContent>
    </Card>
  );
};

export default SuggestedUsers;
