
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
    console.log("Current routes defined in App.tsx should include this path");
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-artijam-purple mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-gray-500 mb-6 text-sm">
        Path: {location.pathname}
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/my-pages">My Pages</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
