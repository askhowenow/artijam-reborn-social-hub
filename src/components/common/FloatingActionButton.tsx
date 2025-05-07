
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Calendar, ShoppingBag, Video, Store } from 'lucide-react';
import { useVendorProfile } from '@/hooks/use-vendor-profile';
import { Button } from '@/components/ui/button';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const { vendorProfile } = useVendorProfile();
  const isVendor = !!vendorProfile;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="h-14 w-14 rounded-full bg-artijam-purple hover:bg-artijam-purple-dark shadow-lg"
          aria-label="Add new content"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-white" 
        align="center"
        sideOffset={5}
        side="top"
      >
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/post/create')}
        >
          <FileText className="h-4 w-4 text-artijam-purple" />
          <span>Add Post</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/events/create')}
        >
          <Calendar className="h-4 w-4 text-artijam-purple" />
          <span>Add Event</span>
        </DropdownMenuItem>
        
        {isVendor && (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/vendor/products/new')}
            >
              <ShoppingBag className="h-4 w-4 text-artijam-purple" />
              <span>Add Product</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/vendor/services')}
            >
              <Store className="h-4 w-4 text-artijam-purple" />
              <span>Add Service</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/vendor/streams/create')}
            >
              <Video className="h-4 w-4 text-artijam-purple" />
              <span>Start Stream</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FloatingActionButton;
