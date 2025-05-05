
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ProfileEditPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          navigate("/login");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        // Set form data
        setUsername(data.username || "");
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setAvatar(data.avatar_url || null);
        
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be less than 2MB");
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error("You must be logged in to update your profile");
        navigate("/login");
        return;
      }
      
      const userId = sessionData.session.user.id;
      let avatarUrl = avatar;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = data.publicUrl;
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          bio,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Success
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      navigate(`/profile/${userId}`);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative cursor-pointer">
                <Avatar className="h-24 w-24">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl text-gray-500">
                        {fullName ? fullName[0].toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-artijam-purple rounded-full p-1.5">
                  <input
                    type="file"
                    className="hidden"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Click to upload a profile picture</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditPage;
