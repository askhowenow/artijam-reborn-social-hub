
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
}

const FeaturedCategories = ({ categories, onCategorySelect }: FeaturedCategoriesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
  );
};

export default FeaturedCategories;
