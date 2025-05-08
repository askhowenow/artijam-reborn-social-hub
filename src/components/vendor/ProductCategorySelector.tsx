
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductCategories } from '@/hooks/use-product-categories';

interface ProductCategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const ProductCategorySelector: React.FC<ProductCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  
  // Fetch product categories
  const { data: databaseCategories = [], isLoading: isCategoriesLoading } = useProductCategories();
  
  // Predefined categories (fallback and additional options)
  const predefinedCategories = [
    'Art & Crafts',
    'Clothing',
    'Digital Products',
    'Food & Beverage',
    'Home Decor',
    'Jewelry',
    'Accessories',
    'Services',
    'Accommodations',
    'Travel',
    'Attractions'
  ];
  
  // Combine database categories with predefined ones, remove duplicates
  const allCategories = [...new Set([...databaseCategories, ...predefinedCategories])].sort();

  // Handle custom category input
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
  };

  // Handle adding custom category
  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      onCategoryChange(customCategory.trim());
      setIsAddingCustomCategory(false);
      setCustomCategory('');
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (value === 'other') {
      setIsAddingCustomCategory(true);
    } else {
      onCategoryChange(value);
      setIsAddingCustomCategory(false);
    }
  };

  return (
    <div>
      <Label htmlFor="category">Category</Label>
      {isAddingCustomCategory ? (
        <div className="flex gap-2">
          <Input
            id="custom-category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder="Enter custom category"
            className="flex-1"
          />
          <Button 
            type="button"
            size="sm"
            onClick={handleAddCustomCategory}
            className="bg-artijam-purple hover:bg-artijam-purple/90"
          >
            Add
          </Button>
        </div>
      ) : (
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
            <SelectItem value="other">
              <span className="flex items-center">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Custom Category
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default ProductCategorySelector;
