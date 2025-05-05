import React, { useState, useEffect } from "react";
import { Shield, Users, MessageSquare, Flag, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Database } from "@/integrations/supabase/types";

// Adding app_role type to match database enum
type AppRole = Database['public']['Enums']['app_role'];

const AdminPage = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'post' | 'comment'} | null>(null);
  
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, roles: string[]} | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Check auth and admin role on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Redirect non-admin users
  useEffect(() => {
    if (!roleLoading && !isAdmin()) {
      uiToast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate, uiToast]);
  
  // Load users
  useEffect(() => {
    if (!isAdmin()) return;
    
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Get all users with their roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url');
          
        if (profilesError) throw profilesError;
        
        // Get all user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (rolesError) throw rolesError;
        
        // Map roles to users
        const usersWithRoles = profilesData.map(profile => {
          const userRoles = rolesData
            .filter(role => role.user_id === profile.id)
            .map(role => role.role);
            
          return {
            id: profile.id,
            name: profile.full_name || profile.username || 'Anonymous',
            username: profile.username || '',
            avatar: profile.avatar_url || '/placeholder.svg',
            roles: userRoles,
          };
        });
        
        setUsers(usersWithRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [isAdmin]);
  
  // Load posts for moderation
  useEffect(() => {
    if (!isAdmin()) return;
    
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, avatar_url, full_name, username)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        // Format posts
        const formattedPosts = data.map(post => ({
          id: post.id,
          content: post.content,
          createdAt: new Date(post.created_at).toLocaleString(),
          author: {
            id: post.profiles.id,
            name: post.profiles.full_name || post.profiles.username || 'Anonymous User',
            avatar: post.profiles.avatar_url || '/placeholder.svg',
          },
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setLoadingPosts(false);
      }
    };
    
    fetchPosts();
  }, [isAdmin]);
  
  // Load comments for moderation
  useEffect(() => {
    if (!isAdmin()) return;
    
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (id, avatar_url, full_name, username),
            post_id
          `)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        // Format comments
        const formattedComments = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          postId: comment.post_id,
          createdAt: new Date(comment.created_at).toLocaleString(),
          author: {
            id: comment.profiles.id,
            name: comment.profiles.full_name || comment.profiles.username || 'Anonymous User',
            avatar: comment.profiles.avatar_url || '/placeholder.svg',
          },
        }));
        
        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [isAdmin]);
  
  // Handle post/comment deletion
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string, type: 'post' | 'comment' }) => {
      const { error } = await supabase
        .from(type === 'post' ? 'posts' : 'comments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { id, type };
    },
    onSuccess: ({ id, type }) => {
      if (type === 'post') {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      } else {
        setComments(prevComments => prevComments.filter(comment => comment.id !== id));
      }
      
      toast.success(`${type === 'post' ? 'Post' : 'Comment'} deleted successfully`);
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    },
  });
  
  // Handle opening delete dialog
  const openDeleteDialog = (id: string, type: 'post' | 'comment') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };
  
  // Handle deleting item
  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  // Handle user role management
  const openUserRoleDialog = (user: {id: string, name: string, roles: string[]}) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setUserRoleDialogOpen(true);
  };
  
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string, roles: AppRole[] }) => {
      // First delete all existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      // If no roles to add, we're done
      if (roles.length === 0) return;
      
      // Add new roles - fix the type issue here
      const rolesToInsert = roles.map(role => ({
        user_id: userId,
        role: role as AppRole, // Ensure role is typed correctly
      }));
      
      const { error } = await supabase
        .from('user_roles')
        .insert(rolesToInsert);
        
      if (error) throw error;
      
      return { userId, roles };
    },
    onSuccess: ({ userId, roles }) => {
      // Update users list with new roles
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, roles } : user
      ));
      
      toast.success(`User roles updated successfully`);
      // Invalidate any queries that might use role information
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
    },
    onError: (error) => {
      console.error("Error updating user roles:", error);
      toast.error("Failed to update user roles");
    },
  });
  
  const handleUpdateRoles = () => {
    if (selectedUser) {
      updateRolesMutation.mutate({
        userId: selectedUser.id,
        // Cast selected roles to AppRole type to ensure type safety
        roles: selectedRoles as AppRole[],
      });
    }
    setUserRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };
  
  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prevRoles => prevRoles.filter(r => r !== role));
    } else {
      setSelectedRoles(prevRoles => [...prevRoles, role]);
    }
  };

  if (roleLoading) {
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

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>Content Moderation</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag size={16} />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>
        
        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <img src={user.avatar} alt={user.name} />
                            </Avatar>
                            <div>
                              <p>{user.name}</p>
                              {user.username && (
                                <p className="text-xs text-gray-500">@{user.username}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map(role => (
                                <span 
                                  key={role}
                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                    role === 'admin' 
                                      ? 'bg-red-100 text-red-800' 
                                      : role === 'moderator'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No roles assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUserRoleDialog(user)}
                          >
                            Manage Roles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Moderation Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 gap-6">
            {/* Posts moderation */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>
                  Review and moderate recent posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
                    <p className="mt-2 text-gray-500">Loading posts...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <img src={post.author.avatar} alt={post.author.name} />
                                </Avatar>
                                <span className="text-sm">{post.author.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="text-sm truncate">{post.content}</p>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {post.createdAt}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/post/${post.id}`)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteDialog(post.id, 'post')}
                              >
                                <Trash2 size={14} className="mr-1" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No posts found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {/* Comments moderation */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
                <CardDescription>
                  Review and moderate recent comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingComments ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-artijam-purple" />
                    <p className="mt-2 text-gray-500">Loading comments...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <img src={comment.author.avatar} alt={comment.author.name} />
                                </Avatar>
                                <span className="text-sm">{comment.author.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="text-sm truncate">{comment.content}</p>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {comment.createdAt}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/post/${comment.postId}`)}
                              >
                                View Post
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteDialog(comment.id, 'comment')}
                              >
                                <Trash2 size={14} className="mr-1" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No comments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>
                Overview of platform activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-artijam-purple">{users.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Total Posts</h3>
                  <p className="text-3xl font-bold text-green-600">{posts.length}+</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Total Comments</h3>
                  <p className="text-3xl font-bold text-amber-600">{comments.length}+</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-500">Detailed analytics coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Role Management Dialog */}
      <Dialog open={userRoleDialogOpen} onOpenChange={setUserRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              {selectedUser && `Assign roles to ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Button
                variant={selectedRoles.includes('admin') ? 'default' : 'outline'}
                onClick={() => toggleRole('admin')}
                className={selectedRoles.includes('admin') ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {selectedRoles.includes('admin') ? (
                  <CheckCircle size={16} className="mr-2" />
                ) : null}
                Admin
              </Button>
              <p className="text-xs text-gray-500">Full access to all features including user management</p>
            </div>
            <div className="space-y-2">
              <Button
                variant={selectedRoles.includes('moderator') ? 'default' : 'outline'}
                onClick={() => toggleRole('moderator')}
                className={selectedRoles.includes('moderator') ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {selectedRoles.includes('moderator') ? (
                  <CheckCircle size={16} className="mr-2" />
                ) : null}
                Moderator
              </Button>
              <p className="text-xs text-gray-500">Can moderate content but cannot manage users</p>
            </div>
            <div className="space-y-2">
              <Button
                variant={selectedRoles.includes('user') ? 'default' : 'outline'}
                onClick={() => toggleRole('user')}
              >
                {selectedRoles.includes('user') ? (
                  <CheckCircle size={16} className="mr-2" />
                ) : null}
                User
              </Button>
              <p className="text-xs text-gray-500">Standard user privileges</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoles}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
