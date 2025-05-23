
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";
import { Calendar, Sun, Moon } from "lucide-react";
import CategoryFilter from "@/components/shop/CategoryFilter";
import ProductGrid from "@/components/shop/ProductGrid";
import FeaturedCategories from "@/components/shop/FeaturedCategories";
import EventCard from "@/components/events/EventCard";
import RunningBanner from "@/components/shop/RunningBanner";
import { useTheme } from "@/context/ThemeProvider";
import type { Event, TicketType } from "@/types/event";

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  
  // Set theme to dark by default for the landing page
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  // Mock data for the landing page (since we can't use hooks that require authentication)
  const featuredProducts = [
    {
      id: "1",
      name: "Handcrafted Artwork #1",
      price: 19.99,
      image_url: "/lovable-uploads/artijam_15d21748b86ac1f2db674bb876ed2643.png",
      category: "Art",
      is_available: true,
      stock_quantity: 10,
      vendor: { business_name: "Artist Studio", is_verified: true }
    },
    {
      id: "2",
      name: "Handcrafted Artwork #2",
      price: 29.99,
      image_url: "/lovable-uploads/artijam_17a04f5cb3fa3aef5479592875ee9ea2.jpg",
      category: "Crafts",
      is_available: true,
      stock_quantity: 5,
      vendor: { business_name: "Craft Masters", is_verified: false }
    },
    {
      id: "3",
      name: "Digital Illustration",
      price: 39.99,
      image_url: "/lovable-uploads/artijam_17b4fb7595233d630cbed4a66ab04c11.jpg",
      category: "Digital",
      is_available: true,
      stock_quantity: 15,
      vendor: { business_name: "Digital Arts", is_verified: true }
    },
    {
      id: "4",
      name: "Handmade Jewelry",
      price: 49.99,
      image_url: "/lovable-uploads/artijam_2bcfe64288e895372d7bbf5652d8389a.jpg",
      category: "Accessories",
      is_available: true,
      stock_quantity: 8,
      vendor: { business_name: "Jewel Crafters", is_verified: true }
    }
  ];

  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Art Workshop",
      description: "Learn the basics of painting landscapes with watercolors",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      location: { 
        city: "San Francisco", 
        state: "California", 
        address: "123 Art St",
        country: "USA",
        postalCode: "94105" 
      },
      status: "published",
      ticketTiers: [{ 
        id: "tier1",
        name: "General Admission",
        description: "Standard entry",
        price: 20,
        currency: "USD",
        quantity: 20,
        quantityAvailable: 20,
        type: "paid" as TicketType,
        salesStartDate: new Date().toISOString(),
        salesEndDate: new Date(Date.now() + 86400000).toISOString()
      }],
      featuredImage: "/lovable-uploads/artijam_05a8ae816465a7e1f2d568c714a9754b.jpg",
      organizerId: "mock-organizer-1",
      organizerName: "Art Workshop Inc.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true,
      capacity: 50
    },
    {
      id: "2",
      title: "Digital Art Exhibition",
      description: "Explore digital art from emerging artists",
      startDate: new Date(Date.now() + 172800000).toISOString(),
      endDate: new Date(Date.now() + 259200000).toISOString(),
      location: { 
        city: "Austin", 
        state: "Texas",
        address: "456 Digital Ave",
        country: "USA",
        postalCode: "78701"
      },
      status: "published",
      ticketTiers: [{ 
        id: "tier2",
        name: "Standard Entry",
        description: "Regular exhibition access",
        price: 15,
        currency: "USD",
        quantity: 50,
        quantityAvailable: 50,
        type: "paid" as TicketType,
        salesStartDate: new Date().toISOString(),
        salesEndDate: new Date(Date.now() + 172800000).toISOString()
      }],
      featuredImage: "/lovable-uploads/artijam_07ceb03c712172f112890ca52143a13d.jpg",
      organizerId: "mock-organizer-2",
      organizerName: "Digital Arts Society",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true,
      capacity: 100
    }
  ];

  // Create banner data combining products and events
  const bannerItems = [
    ...featuredProducts.map(product => ({
      id: product.id,
      type: 'product' as const,
      title: product.name,
      image: product.image_url || '',
      price: product.price,
      category: product.category || 'Art',
      path: `/login` // In a real app, would be `/products/${product.id}`
    })),
    ...mockEvents.map(event => ({
      id: event.id,
      type: 'event' as const,
      title: event.title,
      image: event.featuredImage || '',
      category: 'Events',
      path: `/login` // In a real app, would be `/events/${event.id}`
    }))
  ];

  // Categories same as shop page
  const categoryFilters = [
    'All',
    'Events',
    'Art',
    'Crafts',
    'Digital',
    'Clothing',
    'Accessories',
    'Home Decor'
  ];

  const featuredCategories = ['Events', 'Art', 'Digital', 'Clothing'];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
  };

  const handleFeaturedCategorySelect = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Check if we're showing events or products
  const isEventCategory = selectedCategory === 'Events';
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      {/* Theme toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleTheme}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Hero Section with Prominent Logo */}
      <section className="relative pt-16 pb-8 px-4 md:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Jamaica-inspired gradient background */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-green-600 via-yellow-500 to-black -z-10"></div>
        
        <div className="flex justify-center mb-4">
          <Logo size="lg" className="scale-150 mb-6" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-green-300 to-artijam-purple">
          A Cultural Marketplace Empowering the Creative Economy
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join a vibrant, community-driven ecosystem where artists, artisans, and culture enthusiasts connect, trade, and thrive. Celebrate heritage, fuel innovation, and build sustainable creative businesses at the heart of the orange economy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold text-lg py-6 px-8 border-none"
            onClick={() => navigate("/register")}
          >
            Join Artijam
          </Button>
          <Button
            variant="outline"
            className="border-artijam-purple text-artijam-purple hover:bg-artijam-purple/10 text-lg py-6 px-8"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6">
        {/* Running Banner for Trending Items */}
        <div className="mb-8">
          <RunningBanner 
            data={bannerItems}
            slideDuration={5000}
            className="bg-gray-800/60 backdrop-blur-md border border-gray-700/30 rounded-lg shadow-md p-4"
          />
        </div>

        {/* Category Filters */}
        <CategoryFilter 
          categories={categoryFilters}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Events Grid or Products Grid based on selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">
              {isEventCategory ? 'Upcoming Events' : selectedCategory || 'Featured Products'}
            </h2>
            
            {selectedCategory && (
              <Button 
                variant="link" 
                className="text-artijam-purple"
                onClick={() => setSelectedCategory(null)}
              >
                View All
              </Button>
            )}
          </div>

          {isEventCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEvents.map((event) => (
                <div key={event.id} onClick={() => navigate("/login")} className="cursor-pointer">
                  <EventCard 
                    event={event}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <Card 
                  key={product.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group bg-gray-800/60 backdrop-blur-md border border-gray-700/30"
                  onClick={() => navigate("/login")}
                >
                  <div className="relative bg-gray-900 aspect-square w-full">
                    <img 
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-1 text-gray-100">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-bold text-base sm:text-lg text-yellow-400">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Featured Categories */}
        <FeaturedCategories 
          categories={featuredCategories}
          onCategorySelect={handleFeaturedCategorySelect}
        />

        {/* Why Artijam Section */}
        <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto bg-gray-800/60 backdrop-blur-md border border-gray-700/30 rounded-lg shadow-md my-8">
          <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-300">Why Choose Artijam?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-900/40 to-green-700/40 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-green-600/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Unique Art Pieces</h3>
              <p className="text-gray-300">Discover one-of-a-kind products created by talented artists from around the world.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-700/40 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-yellow-600/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Sell Your Creations</h3>
              <p className="text-gray-300">Join our community of creators and start selling your artwork with no upfront costs.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-purple-600/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-artijam-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Supportive Community</h3>
              <p className="text-gray-300">Connect with fellow artists and art lovers in our growing social platform.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto text-center bg-gradient-to-b from-gray-800/40 to-gray-900/60 backdrop-blur-md border border-gray-700/30 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-300">Ready to start your creative journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of artists and art enthusiasts on Artijam today.
          </p>
          <Button
            className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-gray-900 font-bold text-lg py-6 px-8 shadow-lg transition-all duration-300 border-none"
            onClick={() => navigate("/register")}
          >
            Create Your Account
          </Button>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 md:px-6 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <p>© 2025 Artijam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
