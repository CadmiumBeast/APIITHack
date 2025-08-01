import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';

const Bookings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">View & Approve Bookings</h2>
        <div className="bg-white p-6 rounded shadow min-h-[400px]">
          <p>Booking approval interface will be implemented here...</p>
          {/* Add your booking management content here */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Bookings;
