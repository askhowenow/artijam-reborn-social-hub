
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthProvider";
import { usePages } from "@/hooks/use-pages";
import { FileText, Plus, Edit, Trash, Search as SearchIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CreatePageModal from "@/components/pages/CreatePageModal";

const MyPagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pages, isLoading, deletePage, updatePage } = usePages();

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (page.content && page.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreatePage = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditPage = (pageId: string) => {
    navigate(`/page/${pageId}/edit`);
  };

  const handleViewPage = (slug: string) => {
    navigate(`/@${slug}`);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      deletePage(pageId);
      toast.success("Page deleted successfully");
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  const togglePagePublishStatus = async (pageId: string, published: boolean) => {
    try {
      updatePage({
        id: pageId,
        published: !published,
      });
      toast.success(`Page ${!published ? "published" : "unpublished"} successfully`);
    } catch (error) {
      toast.error(`Failed to ${!published ? "publish" : "unpublish"} page`);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Pages - Manage Your Pages</title>
        <meta name="description" content="Create and manage your pages" />
      </Helmet>

      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Pages</h1>
            <p className="text-gray-500">Create and manage your custom pages</p>
          </div>
          
          <Button onClick={handleCreatePage}>
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search pages..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">No pages found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery 
                ? "Try a different search term"
                : "Create your first page by clicking the 'Create Page' button"
              }
            </p>
            
            <Button className="mt-4" onClick={handleCreatePage}>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <Card key={page.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">{page.title}</CardTitle>
                    <Badge className={page.published ? "bg-green-500" : "bg-yellow-500"}>
                      {page.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-500">
                    @{page.slug}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="line-clamp-3 text-sm">
                    {page.content ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: page.content.length > 150 
                          ? page.content.substring(0, 150) + '...' 
                          : page.content 
                      }} />
                    ) : (
                      <p className="text-gray-400 italic">No content</p>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Updated {formatDistanceToNow(new Date(page.updated_at))} ago
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="flex-1 mr-2"
                    onClick={() => handleViewPage(page.slug)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="px-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPage(page.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePagePublishStatus(page.id, page.published)}>
                        <FileText className="mr-2 h-4 w-4" /> 
                        {page.published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Make sure the CreatePageModal component is properly included */}
      <CreatePageModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </>
  );
};

export default MyPagesPage;
