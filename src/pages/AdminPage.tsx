
import React from "react";
import { Shield, Users, MessageSquare, Flag } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { isAdmin, isLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect non-admin users
  React.useEffect(() => {
    if (!isLoading && !isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-artijam-purple"></div>
      </div>
    );
  }

  // Only render the admin content if the user is an admin
  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users, content, and platform settings</p>
        </div>
        <Shield className="h-12 w-12 text-artijam-purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" /> User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              View, edit, and manage user accounts. Assign roles and handle permissions across the platform.
            </p>
            <button className="mt-4 px-4 py-2 bg-artijam-purple text-white rounded hover:bg-artijam-purple/90 text-sm">
              Manage Users
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" /> Content Moderation
            </CardTitle>
            <CardDescription>
              Review and moderate user-generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Review flagged content, posts, comments, and messages. Take action on inappropriate content.
            </p>
            <button className="mt-4 px-4 py-2 bg-artijam-purple text-white rounded hover:bg-artijam-purple/90 text-sm">
              Moderate Content
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="h-5 w-5 mr-2" /> Reports
            </CardTitle>
            <CardDescription>
              View platform statistics and user reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Access analytics, user growth metrics, content engagement, and other platform statistics.
            </p>
            <button className="mt-4 px-4 py-2 bg-artijam-purple text-white rounded hover:bg-artijam-purple/90 text-sm">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
