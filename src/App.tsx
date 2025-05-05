
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PeoplePage from "@/pages/PeoplePage";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import CreatePostPage from "@/pages/CreatePostPage";
import PostDetailPage from "@/pages/PostDetailPage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import SearchPage from "@/pages/SearchPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import ProductFormPage from "./pages/ProductFormPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(!!data.session);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setIsLoggedIn(!!session);
        });
        
        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-artijam-purple"></div>
      </div>
    );
  }

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
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Routes */}
            <Route element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:userId?" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/post/create" element={<CreatePostPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Shop Routes */}
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
              
              {/* Vendor Routes */}
              <Route path="/vendor/profile" element={<VendorProfilePage />} />
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendor/products/new" element={<ProductFormPage />} />
              <Route path="/vendor/products/:productId/edit" element={<ProductFormPage />} />
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
