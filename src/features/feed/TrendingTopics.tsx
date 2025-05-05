
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// For now, we'll use mock data since this would require content analysis
// In a real app, this would be generated based on post content and tag frequency
const trendingTopics = [
  {
    id: "1",
    tag: "#Artijam2025",
    count: "1.2k posts",
  },
  {
    id: "2",
    tag: "#CreativeEconomy",
    count: "890 posts",
  },
  {
    id: "3",
    tag: "#DigitalArtists",
    count: "756 posts",
  },
  {
    id: "4",
    tag: "#WebDesignTips",
    count: "543 posts",
  },
];

const TrendingTopics = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-artijam-purple" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trendingTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/search?tag=${topic.tag.substring(1)}`}
            className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <p className="font-medium text-sm text-artijam-purple">{topic.tag}</p>
            <p className="text-xs text-gray-500">{topic.count}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
