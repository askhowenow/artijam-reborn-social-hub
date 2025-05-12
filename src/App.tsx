
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import VendorSignUpPage from '@/pages/VendorSignUpPage';
import MyServicesPage from '@/pages/MyServicesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import VendorDashboardPage from '@/pages/VendorDashboardPage';
import MyPagesPage from '@/pages/MyPagesPage';
import VendorProfilePage from '@/pages/VendorProfilePage';
import PageViewPage from '@/pages/PageViewPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import MyProductsPage from '@/pages/MyProductsPage';
import FundingPage from '@/pages/FundingPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ModerationPage from '@/pages/ModerationPage';
import StreamsPage from '@/pages/StreamsPage';
import CreateStreamPage from '@/pages/CreateStreamPage';
import StreamViewPage from '@/pages/StreamViewPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import CreateStorefrontPage from '@/pages/CreateStorefrontPage';
import BalancePage from '@/pages/BalancePage';
import ServiceBookingPage from '@/pages/ServiceBookingPage';
import PageEditorPage from '@/components/pages/PageEditor';
import ProductFormPage from '@/features/vendor/ProductFormPage';
import JobsPage from '@/pages/JobsPage';
import PeoplePage from '@/pages/PeoplePage';
import MessagesPage from '@/pages/MessagesPage';
import GroupsPage from '@/pages/GroupsPage';
import BlogsPage from '@/pages/BlogsPage';
import CoursesPage from '@/pages/CoursesPage';
import ReelsPage from '@/pages/ReelsPage';
import ApplicationsPage from '@/pages/ApplicationsPage';

import { RequireAuth } from '@/components/auth/RequireAuth';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/vendor/signup" element={<VendorSignUpPage />} />
      </Route>

      {/* App routes with sidebar and header */}
      <Route element={<AppLayout />}>
        {/* Home route */}
        <Route path="/" element={<HomePage />} />

        {/* Shop routes */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
        
        {/* Account routes */}
        <Route path="/profile" element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        } />
        
        {/* Community routes */}
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/messages" element={
          <RequireAuth>
            <MessagesPage />
          </RequireAuth>
        } />
        <Route path="/groups" element={
          <RequireAuth>
            <GroupsPage />
          </RequireAuth>
        } />
        
        {/* Content routes */}
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/reels" element={<ReelsPage />} />
        
        {/* Pages routes */}
        <Route path="/my-pages" element={
          <RequireAuth>
            <MyPagesPage />
          </RequireAuth>
        } />
        <Route path="/page/new" element={
          <RequireAuth>
            <PageEditorPage isNew={true} />
          </RequireAuth>
        } />
        <Route path="/page/:id/edit" element={
          <RequireAuth>
            <PageEditorPage />
          </RequireAuth>
        } />
        <Route path="/page/:id" element={<PageViewPage />} />
        
        {/* Live content routes */}
        <Route path="/streams" element={<StreamsPage />} />
        <Route path="/streams/new" element={
          <RequireAuth>
            <CreateStreamPage />
          </RequireAuth>
        } />
        <Route path="/stream/:id" element={<StreamViewPage />} />
        
        {/* Jobs routes */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/my-applications" element={
          <RequireAuth>
            <ApplicationsPage />
          </RequireAuth>
        } />
        
        {/* Finance routes */}
        <Route path="/balance" element={
          <RequireAuth>
            <BalancePage />
          </RequireAuth>
        } />
        <Route path="/funding" element={
          <RequireAuth>
            <FundingPage />
          </RequireAuth>
        } />
        
        {/* Booking routes */}
        <Route path="/my-bookings" element={
          <RequireAuth>
            <MyBookingsPage />
          </RequireAuth>
        } />
        
        {/* Events routes */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        
        {/* Vendor routes */}
        <Route path="/vendor/dashboard" element={
          <RequireAuth>
            <VendorDashboardPage />
          </RequireAuth>
        } />
        <Route path="/vendor/profile" element={
          <RequireAuth>
            <VendorProfilePage />
          </RequireAuth>
        } />
        <Route path="/vendor/products" element={
          <RequireAuth>
            <MyProductsPage />
          </RequireAuth>
        } />
        <Route path="/vendor/products/new" element={
          <RequireAuth>
            <ProductFormPage />
          </RequireAuth>
        } />
        <Route path="/vendor/products/:id" element={
          <RequireAuth>
            <ProductFormPage />
          </RequireAuth>
        } />
        <Route path="/vendor/services" element={
          <RequireAuth>
            <MyServicesPage />
          </RequireAuth>
        } />
        <Route path="/vendor/services/:serviceId" element={
          <RequireAuth>
            <ServiceDetailPage />
          </RequireAuth>
        } />
        <Route path="/service/:id/book" element={
          <RequireAuth>
            <ServiceBookingPage />
          </RequireAuth>
        } />
        <Route path="/vendor/storefront/create" element={
          <RequireAuth>
            <CreateStorefrontPage />
          </RequireAuth>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <RequireAuth requiredRole="admin">
            <AdminDashboardPage />
          </RequireAuth>
        } />
        <Route path="/admin/moderate" element={
          <RequireAuth requiredRole="moderator">
            <ModerationPage />
          </RequireAuth>
        } />
        
        {/* Redirect /wallet to /balance */}
        <Route path="/wallet" element={<Navigate to="/balance" replace />} />
        
        {/* Catch-all route for 404s */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
