
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import AppLayout from "@/components/layout/AppLayout";
import GuestLayout from "@/components/layout/GuestLayout";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import VendorProfilePage from "@/pages/VendorProfilePage";
import VendorDashboardPage from "@/pages/VendorDashboardPage";
import ProductFormPage from "@/pages/ProductFormPage";
import StorefrontCreation from "@/components/vendor/StorefrontCreation";
import StorefrontPage from "@/pages/StorefrontPage";
import DashboardPage from "@/pages/DashboardPage";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import PageEditor from "@/components/pages/PageEditor";
import PageViewPage from "@/pages/PageViewPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-artijam-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/landing" />;
  }
  
  return <>{children}</>;
};

// Public Route - redirects to home if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-artijam-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            
            {/* Guest Layout Routes */}
            <Route element={<GuestLayout />}>
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
            </Route>
            
            {/* App Layout Routes - Protected */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/vendor/profile" element={<VendorProfilePage />} />
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendor/products/new" element={<ProductFormPage />} />
              <Route path="/vendor/products/:id/edit" element={<ProductFormPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/create-storefront" element={<StorefrontCreation />} />
              <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
              
              {/* Page Routes */}
              <Route path="/page/:id/edit" element={<PageEditor />} />
            </Route>

            {/* Public Pages */}
            <Route path="/@:slug" element={<PageViewPage />} />
            
            {/* Public Storefront */}
            <Route path="/@:storeSlug" element={<StorefrontPage />} />
            
            {/* Redirect from Index to Landing or Home */}
            <Route path="/" element={
              <AuthCheck 
                authenticatedRoute="/" 
                unauthenticatedRoute="/landing" 
              />
            } />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Helper component to redirect based on auth status
const AuthCheck = ({ 
  authenticatedRoute, 
  unauthenticatedRoute 
}: { 
  authenticatedRoute: string;
  unauthenticatedRoute: string;
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-artijam-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return <Navigate to={user ? authenticatedRoute : unauthenticatedRoute} replace />;
};

export default App;
