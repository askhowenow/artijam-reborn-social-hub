
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const postType = searchParams.get("type") || "text";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image is too large. Please select an image under 5MB.");
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage) {
      toast.error("Please add some content to your post");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error("You must be logged in to create a post");
        navigate("/login");
        return;
      }
      
      const userId = sessionData.session.user.id;
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, selectedImage);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the uploaded image
        const { data } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Create post
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: userId,
          image_url: imageUrl,
        });
        
      if (error) throw error;
      
      // Success
      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate("/");
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to create a post");
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-32 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {imagePreview ? (
                <div className="relative mt-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="rounded-md max-h-96 mx-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload an image</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </label>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostPage;
