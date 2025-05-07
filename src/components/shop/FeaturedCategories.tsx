
import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
}

const FeaturedCategories = ({ categories, onCategorySelect }: FeaturedCategoriesProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      const container = scrollContainerRef.current;
      const currentPosition = container.scrollLeft;
      container.scrollTo({
        left: direction === 'left' ? currentPosition - scrollAmount : currentPosition + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <h2 className="text-lg xs:text-xl font-bold mb-3">Featured Categories</h2>

      {/* Mobile scrollable view */}
      <div className="relative md:hidden">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 xs:gap-3 pb-2 xs:pb-3 px-1 snap-x -mx-1 xs:mx-0"
        >
          {categories.map((category) => (
            <Card 
              key={category} 
              className="min-w-[80%] xs:min-w-[70%] flex-shrink-0 overflow-hidden snap-center"
            >
              <CardHeader className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/10 p-2 xs:p-3">
                <CardTitle className="text-base xs:text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 xs:p-3">
                <p className="text-xs xs:text-sm text-gray-500 mb-2 xs:mb-3 line-clamp-2">
                  Discover unique {category.toLowerCase()} from independent creators
                </p>
                <Button 
                  variant="link" 
                  className="flex items-center p-0 text-artijam-purple text-xs xs:text-sm"
                  onClick={() => onCategorySelect(category)}
                >
                  Browse {category}
                  <ArrowRight className="ml-1 h-3 w-3 xs:h-4 xs:w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Scroll controls */}
        <div className="flex justify-between mt-2 xs:mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-20 xs:w-24 text-xs py-1 h-8" 
            onClick={() => scroll('left')}
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="mr-0.5 xs:mr-1 h-3 w-3 xs:h-4 xs:w-4" /> Previous
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-20 xs:w-24 text-xs py-1 h-8" 
            onClick={() => scroll('right')}
            style={{ touchAction: 'manipulation' }}
          >
            Next <ChevronRight className="ml-0.5 xs:ml-1 h-3 w-3 xs:h-4 xs:w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop grid view */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/10">
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-500 mb-4">
                Discover unique {category.toLowerCase()} from independent creators
              </p>
              <Button 
                variant="link" 
                className="flex items-center p-0 text-artijam-purple"
                onClick={() => onCategorySelect(category)}
              >
                Browse {category}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default FeaturedCategories;
