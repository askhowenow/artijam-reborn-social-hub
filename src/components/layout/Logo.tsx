
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const location = useLocation();
  
  // Safely access the auth context, with fallback if used outside AuthProvider
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    console.log("Auth context not available");
  }
  
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  // Define the logo image size based on the size prop
  const imgSizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };
  
  // If user is on auth page and not logged in, link to home instead of dashboard
  const linkPath = (isAuthPage && !user) ? "/" : user ? "/dashboard" : "/";

  return (
    <Link to={linkPath} className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/artijam_76f45d1b7937297dc46e48236133b9c6.png" 
        alt="Artijam Logo"
        className={`${imgSizes[size]} w-auto`}
      />
    </Link>
  );
};

export default Logo;
