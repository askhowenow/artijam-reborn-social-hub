
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
  // Define background colors for each category
  const categoryColors = {
    'Art': 'from-blue-500 to-purple-500',
    'Events': 'from-green-500 to-teal-500',
    'Digital': 'from-indigo-500 to-blue-500',
    'Clothing': 'from-pink-500 to-rose-500',
    'Accessories': 'from-amber-500 to-orange-500',
    'Accommodations': 'from-cyan-500 to-blue-500',
    'Travel': 'from-sky-500 to-indigo-500',
    'Food': 'from-amber-400 to-orange-600',
    'Attractions': 'from-emerald-500 to-green-600'
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">Explore Categories</h2>
      
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4">
        {categories.map((category) => {
          const bgGradient = categoryColors[category as keyof typeof categoryColors] || 'from-purple-500 to-pink-500';
          
          return (
            <Card
              key={category}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategorySelect(category)}
            >
              <div className={`h-24 bg-gradient-to-r ${bgGradient} flex items-center justify-center`}>
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
              <div className="p-2 text-center">
                <p className="font-medium text-xs xs:text-sm">{category}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCategories;
