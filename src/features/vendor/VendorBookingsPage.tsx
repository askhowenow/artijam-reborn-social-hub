
import React from 'react';
import VendorBookings from './VendorBookings';

const VendorBookingsPage: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <p className="text-gray-600 mt-1">Track and manage all your service bookings</p>
      </div>
      
      <VendorBookings />
    </div>
  );
};

export default VendorBookingsPage;
