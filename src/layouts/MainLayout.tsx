
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <p className="font-semibold">MainLayout Header</p>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p className="text-gray-600 text-sm">© 2025 Your Service App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
