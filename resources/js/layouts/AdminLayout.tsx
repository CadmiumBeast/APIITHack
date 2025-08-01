import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [notifications] = useState([
    { id: 1, message: 'Blackout date approaching: 2025-08-15' },
    { id: 2, message: 'Room 203 under maintenance' },
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-[#00b2a7] text-white p-5 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">APIIT Admin Panel</h1>
        {/* <div className="relative cursor-pointer" title="Notifications">
          <span className="material-icons select-none">notifications</span>
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full animate-pulse">
              {notifications.length}
            </span>
          )}
        </div> */}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r p-6 shadow-sm overflow-auto">
          <h2 className="text-xl font-bold mb-8 text-[#00b2a7]">Navigation</h2>
          <nav className="space-y-4">
            <SidebarLink label="Dashboard" href="/admin/dashboard" />
            <SidebarLink label="Manage Rooms" href="/admin/rooms" />
            <SidebarLink label="View & Approve Bookings" href="/admin/bookings" />
            <SidebarLink label="Lecture Shedule" href="/admin/classroom" />
            <SidebarLink label="Logout" href="/admin/logout" method="post" />
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <footer className="bg-black text-white text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Asia Pacific Institute of Information Technology. All rights reserved.
      </footer>
    </div>
  );
};

type SidebarLinkProps = {
  label: string;
  href: string;
  method?: 'get' | 'post';
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ label, href, method = 'get' }) => {
  // For server-side routing, we can check the current URL from window.location
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

  return (
    <Link
      href={href}
      method={method}
      className={`block px-3 py-2 rounded font-medium transition ${
        isActive ? 'bg-[#00b2a7] text-white' : 'hover:bg-[#00b2a7] hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
};

export default AdminLayout;
