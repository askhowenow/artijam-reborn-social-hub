
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

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

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Don't render routes until auth state is resolved
  if (isLoading) {
    return null;
  }
  
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
        
        {/* Protected Customer Routes */}
        <Route path="/my-bookings" element={
          user ? <MyBookingsPage /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          user ? <ProfilePage /> : <Navigate to="/login" />
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
