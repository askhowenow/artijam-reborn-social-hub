
import React from "react";
import CreatePostButton from "@/features/feed/CreatePostButton";
import PostCard from "@/features/feed/PostCard";
import SuggestedUsers from "@/features/feed/SuggestedUsers";
import TrendingTopics from "@/features/feed/TrendingTopics";

// Mock posts data
const mockPosts = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Jane Doe",
      avatar: "/placeholder.svg",
    },
    content:
      "Just finished my latest digital art project! What do you think? #digitalart #creativity",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
    likes: 24,
    comments: 5,
    createdAt: "2h ago",
    liked: false,
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Alex Johnson",
      avatar: "/placeholder.svg",
    },
    content:
      "Excited to announce my new course on web development basics! Sign up with early bird pricing today. #webdev #learning",
    likes: 42,
    comments: 11,
    createdAt: "4h ago",
    liked: true,
  },
  {
    id: "3",
    author: {
      id: "user3",
      name: "Sam Rodriguez",
      avatar: "/placeholder.svg",
    },
    content:
      "Looking for collaborators on a new creative project. DM me if interested! #collaboration #creatives",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
    likes: 18,
    comments: 7,
    createdAt: "6h ago",
    liked: false,
  },
];

const HomePage = () => {
  return (
    <div className="container max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <CreatePostButton />
          
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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
