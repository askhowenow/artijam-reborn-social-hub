
import React from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "@/features/auth/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-bold text-artijam-purple mb-2">Artijam</h1>
        <p className="text-gray-600">Join the creator community</p>
      </div>
      
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default RegisterPage;
