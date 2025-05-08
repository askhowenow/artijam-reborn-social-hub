
import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/types/page";
import { FileText, Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PageCardProps {
  page: Page;
  onEdit: (pageId: string) => void;
  onView: (slug: string) => void;
  onPublishToggle: (pageId: string, published: boolean) => void;
  onDelete: (pageId: string) => void;
}

const PageCard: React.FC<PageCardProps> = ({
  page,
  onEdit,
  onView,
  onPublishToggle,
  onDelete,
}) => {
  return (
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
          onClick={() => onView(page.slug)}
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
            <DropdownMenuItem onClick={() => onEdit(page.id)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPublishToggle(page.id, page.published)}>
              <FileText className="mr-2 h-4 w-4" /> 
              {page.published ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-500"
              onClick={() => onDelete(page.id)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default PageCard;
