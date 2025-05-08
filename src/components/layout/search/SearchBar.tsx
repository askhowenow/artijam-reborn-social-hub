
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar: React.FC = () => {
  return (
    <div className="hidden md:flex items-center max-w-md w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" />
        <Input 
          placeholder="Search for products, services, or artists..." 
          className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:ring-artijam-purple dark:focus:ring-artijam-purple-light"
        />
      </div>
    </div>
  );
};

export default SearchBar;
