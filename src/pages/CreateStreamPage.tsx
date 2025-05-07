
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateStream } from '@/hooks/use-streams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';

const CreateStreamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createStream = useCreateStream();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Check if user is logged in
  React.useEffect(() => {
    if (!user) {
      toast.error('You need to be logged in to create a stream');
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }
    
    try {
      const stream = await createStream.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      
      toast.success('Stream created successfully');
      navigate(`/streams/studio/${stream.id}`);
    } catch (error) {
      console.error('Error creating stream:', error);
    }
  };
  
  return (
    <div className="container max-w-2xl py-6">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="flex items-center justify-center mb-6">
        <VideoIcon className="h-8 w-8 text-artijam-purple mr-3" />
        <h1 className="text-3xl font-bold">Create a Stream</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Stream Details</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleCreateStream}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="Enter a title for your stream" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description"
                placeholder="Tell viewers about your stream" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-switch">Public Stream</Label>
                <p className="text-sm text-gray-500">
                  When disabled, only people with the link can watch
                </p>
              </div>
              <Switch 
                id="public-switch"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!title.trim() || createStream.isPending}
            >
              Create Stream
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateStreamPage;
