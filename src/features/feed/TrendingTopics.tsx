
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Mock trending topics data
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
