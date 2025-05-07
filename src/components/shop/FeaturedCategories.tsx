
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
      <h2 className="text-xl font-bold mb-4">Featured Categories</h2>

      {/* Mobile scrollable view */}
      <div className="relative md:hidden">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-1 snap-x"
        >
          {categories.map((category) => (
            <Card 
              key={category} 
              className="min-w-[80%] flex-shrink-0 overflow-hidden snap-center"
            >
              <CardHeader className="bg-gradient-to-r from-artijam-purple/20 to-artijam-purple/10 p-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-gray-500 mb-3">
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
        
        {/* Scroll controls */}
        <div className="flex justify-between mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-24" 
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-24" 
            onClick={() => scroll('right')}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
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

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default FeaturedCategories;
