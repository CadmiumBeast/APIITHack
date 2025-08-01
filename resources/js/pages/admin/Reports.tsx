import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';

const Reports: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Reports</h2>
        <div className="bg-white p-6 rounded shadow min-h-[400px]">
          <p>Reports interface will be implemented here...</p>
          {/* Add your reports content here */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
