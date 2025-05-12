
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
  
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };
  
  // If user is on auth page and not logged in, link to home instead of dashboard
  const linkPath = (isAuthPage && !user) ? "/" : user ? "/dashboard" : "/";

  return (
    <Link to={linkPath} className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {/* Logo "A" as a styled element with a slightly enhanced design */}
        <div className={`font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"} 
          mr-1 text-artijam-purple bg-gradient-to-r from-artijam-purple to-purple-600 bg-clip-text text-transparent`}>
          A
        </div>
        <span className={`font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"} text-gray-800 dark:text-white`}>
          rtijam
        </span>
      </div>
    </Link>
  );
};

export default Logo;
