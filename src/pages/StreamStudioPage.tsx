
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStream } from '@/hooks/use-streams';
import StreamBroadcaster from '@/components/streams/StreamBroadcaster';
import StreamChat from '@/components/streams/StreamChat';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Settings, MessageSquare, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';

const StreamStudioPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { streamId } = useParams<{ streamId: string }>();
  const { data: stream, isLoading, error } = useStream(streamId);
  
  // Check if user is logged in and owns the stream
  useEffect(() => {
    if (!isLoading && !error) {
      if (!user) {
        toast.error('You need to be logged in to access the studio');
        navigate('/login');
      } else if (stream && stream.userId !== user.id) {
        toast.error('You can only manage your own streams');
        navigate('/streams');
      }
    }
  }, [stream, user, isLoading, error, navigate]);

  // Handle back button
  const handleBack = () => {
    navigate(`/streams/${streamId}`);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md" />
        <div className="aspect-video bg-gray-200 animate-pulse rounded-md" />
      </div>
    );
  }
  
  if (!stream) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Stream not found</h2>
          <p className="text-gray-500 mt-2">
            The stream you're looking for might have been deleted
          </p>
          <Button className="mt-4" onClick={() => navigate('/streams/new')}>
            Create a new stream
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            View Stream
          </Button>
          <h1 className="text-2xl font-bold">{stream.title}</h1>
        </div>
      </div>
      
      <Tabs defaultValue="broadcast">
        <TabsList className="mb-4">
          <TabsTrigger value="broadcast">
            <Activity className="h-4 w-4 mr-2" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="broadcast" className="space-y-6">
          <StreamBroadcaster stream={stream} />
        </TabsContent>
        
        <TabsContent value="chat">
          <div className="max-w-md mx-auto">
            <StreamChat streamId={stream.id} className="h-[600px]" />
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input 
                  id="title"
                  defaultValue={stream.title}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  defaultValue={stream.description || ''}
                  rows={4}
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
                  defaultChecked={stream.isPublic}
                />
              </div>
              
              <div className="flex justify-end">
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StreamStudioPage;
