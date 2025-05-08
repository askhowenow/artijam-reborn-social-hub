
import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/LoginForm";
import Logo from "@/components/layout/Logo";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>
        <p className="text-gray-600">A Cultural Marketplace Empowering the Creative Economy</p>
      </div>
      
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
