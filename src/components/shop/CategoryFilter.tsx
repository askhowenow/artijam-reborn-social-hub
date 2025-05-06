
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
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? "default" : "outline"}
            className="px-3 py-1 cursor-pointer bg-artijam-purple"
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
