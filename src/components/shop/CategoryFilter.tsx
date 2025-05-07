
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false
  });

  // Check if scroll buttons should be visible
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowScrollButtons({
      left: scrollLeft > 0,
      right: scrollLeft + clientWidth < scrollWidth - 10 // small buffer
    });
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  // Handle scrolling left and right
  const scrollCategories = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 150; // px to scroll
    const currentScroll = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Scroll left button */}
      {showScrollButtons.left && (
        <button 
          onClick={() => scrollCategories('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 md:hidden"
          aria-label="Scroll left"
          style={{ touchAction: 'manipulation' }}
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}
      
      <div 
        className="overflow-x-auto scrollbar-hide flex items-center pb-2 px-1 -mx-1 xs:mx-0"
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
      >
        <div className="flex gap-1 xs:gap-2 min-w-max pb-1">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? "default" : "outline"}
              className={`cursor-pointer text-2xs xs:text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 whitespace-nowrap min-h-[32px] flex items-center justify-center ${
                selectedCategory === category || (category === 'All' && !selectedCategory)
                  ? "bg-artijam-purple"
                  : "hover:bg-artijam-purple/10"
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Scroll right button */}
      {showScrollButtons.right && (
        <button 
          onClick={() => scrollCategories('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 md:hidden"
          aria-label="Scroll right"
          style={{ touchAction: 'manipulation' }}
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;
