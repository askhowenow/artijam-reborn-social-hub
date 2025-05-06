
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-artijam-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <Navigate to={user ? "/" : "/landing"} replace />;
};

export default Index;
