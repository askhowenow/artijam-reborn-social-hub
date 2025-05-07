
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, ShoppingBag, Calendar, Settings, PlusCircle, Video, FileText, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

const SideNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white z-10 overflow-y-auto hidden md:block">
      <nav className="p-4 space-y-6">
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Dashboard</h3>
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
        </div>

        {/* Shop Section */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Shop</h3>
          <Link
            to="/shop"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/shop" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <ShoppingBag size={18} />
            <span>Shop</span>
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/my-bookings" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <ShoppingCart size={18} />
              <span>My Bookings</span>
            </Link>
          )}
        </div>

        {/* Events Section */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Events</h3>
          <Link
            to="/events"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/events" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Calendar size={18} />
            <span>All Events</span>
          </Link>
          {user && (
            <Link
              to="/my-events"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/my-events" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <Calendar size={18} />
              <span>My Events</span>
            </Link>
          )}
        </div>

        {/* Pages Section */}
        {user && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-500 px-3">Pages</h3>
            <Link
              to="/my-pages"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/my-pages" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <FileText size={18} />
              <span>My Pages</span>
            </Link>
          </div>
        )}
        
        {/* Live Content Section (already exists) */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Live Content</h3>
          <Link
            to="/streams"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/streams" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Video size={18} />
            <span>Live Streams</span>
          </Link>
          {user && (
            <Link
              to="/streams/new"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/streams/new" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <Video size={18} />
              <span>Go Live</span>
            </Link>
          )}
        </div>

        {user && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-500 px-3">Vendor</h3>
            <Link
              to="/vendor/products"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname.startsWith("/vendor/products") ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <ShoppingBag size={18} />
              <span>Products</span>
            </Link>
            <Link
              to="/vendor/bookings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/vendor/bookings" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <Calendar size={18} />
              <span>Bookings</span>
            </Link>
            <Link
              to="/vendor/products/new"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/vendor/products/new" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <PlusCircle size={18} />
              <span>Add Product</span>
            </Link>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Account</h3>
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/profile" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Users size={18} />
            <span>Profile</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/settings" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default SideNavigation;
