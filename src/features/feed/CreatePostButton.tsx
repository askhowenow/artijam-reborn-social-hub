
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Image, Smile, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const CreatePostButton = () => {
  const [avatar, setAvatar] = useState<string>('/placeholder.svg');
  const [userInitials, setUserInitials] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      // First get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return;
      
      const userId = sessionData.session.user.id;
      
      // Then fetch profile
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, username')
        .eq('id', userId)
        .single();
        
      if (data) {
        if (data.avatar_url) {
          setAvatar(data.avatar_url);
        } else {
          // Set initials if no avatar
          const name = data.full_name || data.username || '';
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
          setUserInitials(initials || '');
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {avatar !== '/placeholder.svg' ? (
              <img src={avatar} alt="Your avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-artijam-purple text-white">
                {userInitials || 'U'}
              </div>
            )}
          </Avatar>
          <Link
            to="/post/create"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm rounded-full px-4 py-2.5 transition-colors"
          >
            What's on your mind?
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-4 pt-2 border-t">
          <Link to="/post/create?type=photo" className="text-center">
            <Button variant="ghost" size="sm" className="flex items-center justify-center w-full space-x-1 px-1 sm:px-2">
              <Image size={16} />
              <span className="text-xs">Photo</span>
            </Button>
          </Link>
          <Link to="/post/create?type=article" className="text-center">
            <Button variant="ghost" size="sm" className="flex items-center justify-center w-full space-x-1 px-1 sm:px-2">
              <FileText size={16} />
              <span className="text-xs">Article</span>
            </Button>
          </Link>
          <Link to="/post/create" className="text-center">
            <Button variant="ghost" size="sm" className="flex items-center justify-center w-full space-x-1 px-1 sm:px-2">
              <Smile size={16} />
              <span className="text-xs">Feeling</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostButton;
