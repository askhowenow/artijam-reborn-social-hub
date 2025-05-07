
import React from 'react';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex flex-wrap gap-2 min-w-max md:min-w-0">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? "default" : "outline"}
            className={`px-4 py-2 cursor-pointer text-sm ${
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
  );
};

export default CategoryFilter;
