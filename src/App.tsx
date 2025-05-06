
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthProvider";
import AppLayout from "@/components/layout/AppLayout";
import GuestLayout from "@/components/layout/GuestLayout";
import HomePage from "@/pages/HomePage";
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
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
              <Route path="/@:storeSlug" element={<StorefrontPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<GuestLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
