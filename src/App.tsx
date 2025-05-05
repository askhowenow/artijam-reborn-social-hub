
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PeoplePage from "@/pages/PeoplePage";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => {
  // Basic auth check - would be replaced with a more robust auth system
  const isLoggedIn = localStorage.getItem("artijam_user") !== null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/" /> : <RegisterPage />}
            />

            {/* Protected Routes */}
            <Route element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/people" element={<PeoplePage />} />
              {/* More routes will be added as needed */}
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
