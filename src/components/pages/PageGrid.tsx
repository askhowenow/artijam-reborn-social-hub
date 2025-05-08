
import React from "react";
import { Page } from "@/types/page";
import PageCard from "./PageCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageGridProps {
  pages: Page[];
  isLoading: boolean;
  searchQuery: string;
  onCreatePage: () => void;
  onEditPage: (pageId: string) => void;
  onViewPage: (slug: string) => void;
  onTogglePagePublishStatus: (pageId: string, published: boolean) => void;
  onDeletePage: (pageId: string) => void;
}

const PageGrid: React.FC<PageGridProps> = ({
  pages,
  isLoading,
  searchQuery,
  onCreatePage,
  onEditPage,
  onViewPage,
  onTogglePagePublishStatus,
  onDeletePage,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-artijam-purple border-t-transparent"></div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium">No pages found</h3>
        <p className="text-gray-500 mt-1">
          {searchQuery 
            ? "Try a different search term"
            : "Create your first page by clicking the 'Create Page' button"
          }
        </p>
        
        <Button className="mt-4" onClick={onCreatePage}>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page) => (
        <PageCard
          key={page.id}
          page={page}
          onEdit={onEditPage}
          onView={onViewPage}
          onPublishToggle={onTogglePagePublishStatus}
          onDelete={onDeletePage}
        />
      ))}
    </div>
  );
};

export default PageGrid;
