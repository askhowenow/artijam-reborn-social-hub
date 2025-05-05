
import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="flex items-center">
        <img
          src="/lovable-uploads/b7e91f04-f838-4ada-bbfa-4d9e6af5067c.png"
          alt="Artijam Logo"
          className={`${sizeClasses[size]} mr-1`}
        />
        <span className={`font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"} text-artijam-purple`}>
          rtijam
        </span>
      </div>
    </Link>
  );
};

export default Logo;
