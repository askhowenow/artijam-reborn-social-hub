
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Image, Smile, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const CreatePostButton = () => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img src="/placeholder.svg" alt="Your avatar" />
          </Avatar>
          <Link
            to="/post"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm rounded-full px-4 py-2.5 transition-colors"
          >
            What's on your mind?
          </Link>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t">
          <Link to="/post" className="flex items-center text-xs text-gray-500">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Image size={16} />
              <span>Photo</span>
            </Button>
          </Link>
          <Link to="/post" className="flex items-center text-xs text-gray-500">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Article</span>
            </Button>
          </Link>
          <Link to="/post" className="flex items-center text-xs text-gray-500">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Smile size={16} />
              <span>Feeling</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostButton;
