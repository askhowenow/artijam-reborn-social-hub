
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePages } from "@/hooks/use-pages";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreatePageModal from "@/components/pages/CreatePageModal";
import PageSearch from "@/components/pages/PageSearch";
import PageGrid from "@/components/pages/PageGrid";

const MyPagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
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

  const handleTogglePagePublishStatus = async (pageId: string, published: boolean) => {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
          <PageSearch 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange} 
          />
        </div>
        
        <PageGrid
          pages={filteredPages}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onCreatePage={handleCreatePage}
          onEditPage={handleEditPage}
          onViewPage={handleViewPage}
          onTogglePagePublishStatus={handleTogglePagePublishStatus}
          onDeletePage={handleDeletePage}
        />
      </div>
      
      <CreatePageModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </>
  );
};

export default MyPagesPage;
