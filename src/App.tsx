
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import GuestLayout from '@/components/layout/GuestLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import FundingPage from '@/pages/FundingPage';
import StreamsPage from '@/pages/StreamsPage';
import CreateStreamPage from '@/pages/CreateStreamPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import BalancePage from '@/pages/BalancePage';
import JobsPage from '@/pages/JobsPage';
import PeoplePage from '@/pages/PeoplePage';
import MessagesPage from '@/pages/MessagesPage';
import GroupsPage from '@/pages/GroupsPage';
import BlogsPage from '@/pages/BlogsPage';
import CoursesPage from '@/pages/CoursesPage';
import ReelsPage from '@/pages/ReelsPage';
import ApplicationsPage from '@/pages/ApplicationsPage';

// Auth provider context
import { useAuth } from '@/context/AuthProvider';

// Simple RequireAuth component
const RequireAuth = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
        
        {/* Live content routes */}
        <Route path="/streams" element={<StreamsPage />} />
        <Route path="/streams/new" element={
          <RequireAuth>
            <CreateStreamPage />
          </RequireAuth>
        } />
        
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
        
        {/* Events routes */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        
        {/* Redirect /wallet to /balance */}
        <Route path="/wallet" element={<Navigate to="/balance" replace />} />
        
        {/* Catch-all route for 404s */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
