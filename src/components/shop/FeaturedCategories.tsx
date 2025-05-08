
import React from 'react';
import { Card } from '@/components/ui/card';

interface FeaturedCategoriesProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  categoryIcons?: Record<string, React.ReactNode>;
}

const FeaturedCategories = ({ 
  categories,
  onCategorySelect,
  categoryIcons = {}
}: FeaturedCategoriesProps) => {
  // Define background colors for each category - Jamaican inspired
  const categoryColors = {
    'Art': 'from-green-600 to-green-800',
    'Events': 'from-yellow-500 to-amber-700',
    'Digital': 'from-black to-gray-800',
    'Clothing': 'from-black to-green-900',
    'Accessories': 'from-yellow-600 to-amber-800',
    'Accommodations': 'from-green-700 to-green-900',
    'Travel': 'from-amber-600 to-yellow-800',
    'Food': 'from-green-500 to-yellow-600',
    'Attractions': 'from-black to-green-800'
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-gray-100 dark:text-gray-100">Explore Categories</h2>
      
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4">
        {categories.map((category) => {
          const bgGradient = categoryColors[category as keyof typeof categoryColors] || 'from-green-600 to-yellow-600';
          
          return (
            <Card
              key={category}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gray-800/20 dark:bg-gray-800/20 border-gray-700/30"
              onClick={() => onCategorySelect(category)}
            >
              <div className={`h-24 bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
                <div className="text-white">
                  {categoryIcons[category] ? (
                    React.cloneElement(categoryIcons[category] as React.ReactElement, { 
                      className: "h-8 w-8 md:h-10 md:w-10"
                    })
                  ) : (
                    <div className="h-8 w-8 md:h-10 md:w-10 bg-white/20 rounded-full" />
                  )}
                </div>
              </div>
              <div className="p-2 text-center bg-gray-800/60 backdrop-blur-sm">
                <p className="font-medium text-xs xs:text-sm text-gray-100">{category}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCategories;
