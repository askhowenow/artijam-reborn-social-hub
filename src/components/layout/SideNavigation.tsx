
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Users, ShoppingBag, Calendar, Settings, PlusCircle, Video, 
  FileText, ShoppingCart, Briefcase, MessageSquare, User, Wallet, 
  DollarSign, Book, LayoutDashboard, Users as UsersGroup, File
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useUserRole } from "@/hooks/use-user-role";

const SideNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();

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

        {/* Community Section - New */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Community</h3>
          <Link
            to="/people"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/people" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Users size={18} />
            <span>People</span>
          </Link>
          {user && (
            <>
              <Link
                to="/messages"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                  location.pathname === "/messages" ? "text-artijam-purple font-medium" : ""
                }`}
              >
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
              <Link
                to="/groups"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                  location.pathname === "/groups" ? "text-artijam-purple font-medium" : ""
                }`}
              >
                <UsersGroup size={18} />
                <span>Groups</span>
              </Link>
            </>
          )}
        </div>

        {/* Content Section - New */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Content</h3>
          <Link
            to="/blogs"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/blogs" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <FileText size={18} />
            <span>Blogs</span>
          </Link>
          <Link
            to="/courses"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/courses" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Book size={18} />
            <span>Courses</span>
          </Link>
          <Link
            to="/reels"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/reels" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Video size={18} />
            <span>Reels</span>
          </Link>
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
        
        {/* Live Content Section */}
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

        {/* Jobs Section - New */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-500 px-3">Jobs</h3>
          <Link
            to="/jobs"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
              location.pathname === "/jobs" ? "text-artijam-purple font-medium" : ""
            }`}
          >
            <Briefcase size={18} />
            <span>Browse Jobs</span>
          </Link>
          {user && (
            <Link
              to="/my-applications"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/my-applications" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <File size={18} />
              <span>My Applications</span>
            </Link>
          )}
        </div>

        {/* Finance Section - New */}
        {user && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-500 px-3">Finance</h3>
            <Link
              to="/wallet"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/wallet" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <Wallet size={18} />
              <span>Wallet</span>
            </Link>
            <Link
              to="/funding"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/funding" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <DollarSign size={18} />
              <span>Funding</span>
            </Link>
          </div>
        )}

        {user && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-500 px-3">Vendor</h3>
            <Link
              to="/vendor/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/vendor/dashboard" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
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
              to="/vendor/services"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                location.pathname === "/vendor/services" ? "text-artijam-purple font-medium" : ""
              }`}
            >
              <Briefcase size={18} />
              <span>My Services</span>
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

        {/* Admin Section - Conditionally rendered */}
        {user && (isAdmin() || isModerator()) && (
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-500 px-3">Admin</h3>
            {isAdmin() && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                  location.pathname === "/admin/dashboard" ? "text-artijam-purple font-medium" : ""
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            {isModerator() && (
              <Link
                to="/admin/moderate"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                  location.pathname === "/admin/moderate" ? "text-artijam-purple font-medium" : ""
                }`}
              >
                <Settings size={18} />
                <span>Moderation</span>
              </Link>
            )}
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
            <User size={18} />
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
