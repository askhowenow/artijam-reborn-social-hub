
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import GuestLayout from "@/components/layout/GuestLayout";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
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
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MyEventsPage from "@/pages/MyEventsPage";
import MyPagesPage from "@/pages/MyPagesPage";
import MyProductsPage from "@/pages/MyProductsPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import ServicesPage from "@/pages/ServicesPage";
import { EventModalProvider } from "@/hooks/use-event-modal";
import StreamsPage from "@/pages/StreamsPage";
import StreamDetailPage from "@/pages/StreamDetailPage";
import CreateStreamPage from "@/pages/CreateStreamPage";
import StreamStudioPage from "@/pages/StreamStudioPage";
import { Toaster as SonnerToaster } from "sonner";

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
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <EventModalProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/landing" element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } />
                
                {/* Auth Callback Route for OAuth - Must be outside the layouts */}
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                
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
                  <Route path="/vendor/products" element={<MyProductsPage />} />
                  <Route path="/vendor/products/new" element={<ProductFormPage />} />
                  <Route path="/vendor/products/:id/edit" element={<ProductFormPage />} />
                  <Route path="/vendor/services" element={<ServicesPage vendor />} />
                  <Route path="/vendor/bookings" element={<MyBookingsPage vendor />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/create-storefront" element={<StorefrontCreation />} />
                  <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  
                  {/* Events Routes */}
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/my-events" element={<MyEventsPage />} />
                  
                  {/* Pages Routes - Fixed to work correctly */}
                  <Route path="/my-pages" element={<MyPagesPage />} />
                  <Route path="/@:slug" element={<PageViewPage />} />
                  <Route path="/page/new" element={<PageEditor isNew={true} />} />
                  <Route path="/page/:id/edit" element={<PageEditor />} />
                  
                  {/* Store Routes */}
                  <Route path="/store/@:storeSlug" element={<StorefrontPage />} />
                  <Route path="/store/@:storeSlug/product/:productId" element={<StorefrontPage />} />
                  
                  {/* Live Streaming Routes */}
                  <Route path="/streams" element={<StreamsPage />} />
                  <Route path="/streams/:streamId" element={<StreamDetailPage />} />
                  <Route path="/streams/new" element={<CreateStreamPage />} />
                  <Route path="/streams/studio/:streamId" element={<StreamStudioPage />} />
                </Route>
                
                {/* Default redirect from root to landing or home */}
                <Route index element={
                  <AuthCheck 
                    authenticatedRoute="/" 
                    unauthenticatedRoute="/landing" 
                  />
                } />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              
              <Toaster />
              <SonnerToaster position="top-right" />
            </EventModalProvider>
          </AuthProvider>
        </ThemeProvider>
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
