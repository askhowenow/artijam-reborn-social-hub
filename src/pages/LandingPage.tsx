
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const navigate = useNavigate();

  const featuredImages = [
    "/lovable-uploads/artijam_15d21748b86ac1f2db674bb876ed2643.png",
    "/lovable-uploads/artijam_17a04f5cb3fa3aef5479592875ee9ea2.jpg",
    "/lovable-uploads/artijam_17b4fb7595233d630cbed4a66ab04c11.jpg",
    "/lovable-uploads/artijam_2bcfe64288e895372d7bbf5652d8389a.jpg",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-500">
          Welcome to Artijam
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The creative marketplace for artists and art enthusiasts. 
          Discover unique handmade products or sell your own creations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-artijam-purple hover:bg-artijam-purple/90 text-lg py-6 px-8"
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

      {/* Featured Products */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredImages.map((img, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={img} 
                  alt={`Featured product ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">Handcrafted Artwork #{index + 1}</h3>
                <p className="text-sm text-gray-500 mb-2">By Artist Studio</p>
                <p className="font-bold text-artijam-purple">${(19.99 + index * 10).toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-artijam-purple text-artijam-purple"
            onClick={() => navigate("/shop")}
          >
            Browse All Products
          </Button>
        </div>
      </section>

      {/* Why Artijam Section */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm my-8">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Artijam?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-artijam-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Unique Art Pieces</h3>
            <p className="text-gray-600">Discover one-of-a-kind products created by talented artists from around the world.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-artijam-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sell Your Creations</h3>
            <p className="text-gray-600">Join our community of creators and start selling your artwork with no upfront costs.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-artijam-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Supportive Community</h3>
            <p className="text-gray-600">Connect with fellow artists and art lovers in our growing social platform.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start your creative journey?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of artists and art enthusiasts on Artijam today.
        </p>
        <Button
          className="bg-artijam-purple hover:bg-artijam-purple/90 text-lg py-6 px-8"
          onClick={() => navigate("/register")}
        >
          Create Your Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 px-4 md:px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 Artijam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
