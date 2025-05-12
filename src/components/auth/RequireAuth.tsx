
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-artijam-purple"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default RequireAuth;
