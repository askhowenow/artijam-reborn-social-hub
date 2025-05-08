
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import VendorLayout from '@/layouts/VendorLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public Pages
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import StorefrontPage from '@/pages/StorefrontPage';
import ProductPage from '@/pages/ProductPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import StreamingPage from '@/pages/StreamingPage';

// Protected Pages
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import CreateStorefrontPage from '@/pages/CreateStorefrontPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Vendor Pages
import VendorProfilePage from '@/features/vendor/VendorProfilePage';
import ManageProductsPage from '@/features/vendor/ManageProductsPage';
import VendorAnalyticsPage from '@/features/vendor/VendorAnalyticsPage';
import ProductFormPage from '@/features/vendor/ProductFormPage';
import VendorStreamingPage from '@/features/vendor/VendorStreaming';
import VendorBookingsPage from '@/features/vendor/VendorBookingsPage';

// Admin Pages
import AdminDashboardPage from '@/features/admin/AdminDashboardPage';
import AdminUsersPage from '@/features/admin/AdminUsersPage';
import AdminProductsPage from '@/features/admin/AdminProductsPage';

// New Pages
import ShopPage from '@/pages/ShopPage';
import BlogsPage from '@/pages/BlogsPage';
import CoursesPage from '@/pages/CoursesPage';
import ReelsPage from '@/pages/ReelsPage';
import MessagesPage from '@/pages/MessagesPage';
import GroupsPage from '@/pages/GroupsPage';
import JobsPage from '@/pages/JobsPage';
import MyApplicationsPage from '@/pages/MyApplicationsPage';
import WalletPage from '@/pages/WalletPage';
import FundingPage from '@/pages/FundingPage';
import SettingsPage from '@/pages/SettingsPage';
import PeoplePage from '@/pages/PeoplePage';

// Get the hostname from the current URL
const getHostname = () => {
  return window.location.hostname;
};

// Check if the current URL is a subdomain
const isSubdomain = (hostname: string) => {
  // List of known root domains - in a real app, this would be configurable
  const rootDomains = ['localhost', 'artijam.com', 'artijam.local'];
  
  // For local development testing with subdomains like vendor-name.localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  
  // Check if the hostname is directly one of our root domains
  if (rootDomains.includes(hostname)) return false;
  
  // Check if the hostname ends with any of our root domains (preceded by a dot)
  return rootDomains.some(domain => 
    hostname.endsWith('.' + domain) && 
    hostname !== 'www.' + domain
  );
};

// Extract subdomain from hostname
const getSubdomain = (hostname: string) => {
  // For development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  
  // For production
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isSubdomainLoading, setIsSubdomainLoading] = useState(true);
  
  useEffect(() => {
    const hostname = getHostname();
    if (isSubdomain(hostname)) {
      const extractedSubdomain = getSubdomain(hostname);
      setSubdomain(extractedSubdomain);
      
      // Fetch vendor ID from subdomain
      const fetchVendorId = async () => {
        try {
          const { data, error } = await supabase
            .from('vendor_profiles')
            .select('id')
            .eq('subdomain', extractedSubdomain)
            .eq('uses_subdomain', true)
            .single();
          
          if (error) throw error;
          if (data) setVendorId(data.id);
        } catch (err) {
          console.error('Error fetching vendor from subdomain:', err);
          setVendorId(null);
        } finally {
          setIsSubdomainLoading(false);
        }
      };
      
      fetchVendorId();
    } else {
      setSubdomain(null);
      setVendorId(null);
      setIsSubdomainLoading(false);
    }
  }, []);
  
  // Don't render routes until auth state is resolved
  if (isLoading || isSubdomainLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If this is a subdomain request and we have a vendor ID, show the storefront
  if (subdomain && vendorId) {
    return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<StorefrontPage vendorId={vendorId} />} />
          <Route path="/:productId" element={<ProductPage />} />
          <Route path="*" element={<StorefrontPage vendorId={vendorId} />} />
        </Route>
      </Routes>
    );
  }
  
  // Regular routing for main domain
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/@:slug" element={<StorefrontPage />} />
        <Route path="/@:slug/:productId" element={<ProductPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/streams/:id" element={<StreamingPage />} />
        
        {/* New Public Routes */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/groups" element={
          user ? <GroupsPage /> : <Navigate to="/login" />
        } />
        
        {/* Protected Customer Routes */}
        <Route path="/my-bookings" element={
          user ? <MyBookingsPage /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          user ? <ProfilePage /> : <Navigate to="/login" />
        } />
        <Route path="/messages" element={
          user ? <MessagesPage /> : <Navigate to="/login" />
        } />
        <Route path="/my-applications" element={
          user ? <MyApplicationsPage /> : <Navigate to="/login" />
        } />
        <Route path="/wallet" element={
          user ? <WalletPage /> : <Navigate to="/login" />
        } />
        <Route path="/funding" element={
          user ? <FundingPage /> : <Navigate to="/login" />
        } />
        <Route path="/settings" element={
          user ? <SettingsPage /> : <Navigate to="/login" />
        } />
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        user ? <MainLayout /> : <Navigate to="/login" />
      }>
        <Route index element={<DashboardPage />} />
        <Route path="create-storefront" element={<CreateStorefrontPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor" element={
        user ? <VendorLayout /> : <Navigate to="/login" />
      }>
        <Route index element={<VendorProfilePage />} />
        <Route path="profile" element={<VendorProfilePage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="services" element={<ServicesPage vendor={true} />} />
        <Route path="analytics" element={<VendorAnalyticsPage />} />
        <Route path="streams" element={<VendorStreamingPage />} />
        <Route path="bookings" element={<VendorBookingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        user ? <AdminLayout /> : <Navigate to="/login" />
      }>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
