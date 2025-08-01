import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import RoomsPage from './ManageRooms';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#00b2a7', '#FFBB28', '#FF8042', '#8884d8'];

const todayBookingData = [
  { name: 'Booked', value: 15 },
  { name: 'Canceled', value: 3 },
  { name: 'Completed', value: 12 },
  { name: 'No Shows', value: 1 },
];

const monthlyBookingData = [
  { month: 'Jan', bookings: 50 },
  { month: 'Feb', bookings: 70 },
  { month: 'Mar', bookings: 40 },
  { month: 'Apr', bookings: 80 },
  { month: 'May', bookings: 65 },
  { month: 'Jun', bookings: 90 },
];

const availableSlotsByDate: Record<string, string[]> = {
  '2025-08-04': ['9:00 AM - 10:00 AM', '1:00 PM - 2:00 PM', '3:00 PM - 4:00 PM'],
  '2025-08-05': ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM'],
};

const DashboardPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const formatDateKey = (date: Date | null) =>
    date ? date.toISOString().split('T')[0] : '';

  const slots = selectedDate ? availableSlotsByDate[formatDateKey(selectedDate)] || [] : [];

  const timeSlots = [
    { time: '8:30 AM - 10:30 AM', status: 'Booked' },
    { time: '10:30 AM - 12:30 PM', status: 'Pending' },
    { time: '12:30 PM - 2:30 PM', status: 'Cancelled' },
    { time: '2:30 PM - 4:30 PM', status: 'Available' },
  ];

  const statusColors: Record<string, string> = {
    Booked: 'bg-red-100 text-red-600',
    Pending: 'bg-yellow-100 text-yellow-600',
    Cancelled: 'bg-gray-100 text-gray-600',
    Available: 'bg-green-100 text-green-600',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 md:px-8 py-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12">
        <DashboardCard title="Total Rooms" value="12" color="text-[#00b2a7]" />
        <DashboardCard title="Pending Approvals" value="4" color="text-yellow-500" />
        <DashboardCard title="Total Bookings (This Month)" value="120" color="text-green-600" />
      </section>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
  {/* Select a Date Section (Left) */}
  <section className="bg-white p-6 rounded shadow-md w-full lg:w-1/2">
    <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">Select a Date</h3>
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      inline
    />
  </section>

  {/* Time Slots Section (Right) */}
  <section className="bg-white p-6 rounded shadow-md w-full lg:w-1/2">
    <h3 className="text-lg font-semibold mb-4 text-[#00b2a7]">
      Available Time Slots on {selectedDate?.toLocaleDateString()}
    </h3>
    <ul className="space-y-3">
      {timeSlots.map((slot, index) => (
        <li
          key={index}
          className={`flex justify-between items-center p-3 rounded border ${statusColors[slot.status]}`}
        >
          <span className="font-medium">{slot.time}</span>
          <span className="text-sm px-2 py-1 rounded bg-opacity-80 capitalize">
            {slot.status}
          </span>
        </li>
      ))}
    </ul>
  </section>
</div>


      <section className="flex flex-col lg:flex-row gap-8">
        <div className="bg-white p-6 rounded shadow-md w-full lg:w-1/3 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">Today's Bookings Overview</h3>
          <div style={{ width: 280, height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={todayBookingData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#00b2a7"
                  labelLine={true}
                  label={({ name }) => name}
                >
                  {todayBookingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ marginTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-md flex-1">
          <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={monthlyBookingData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#00b2a7"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

const BookingsPage = () => <PageWrapper title="View & Approve Bookings">Booking approvals here...</PageWrapper>;
const AvailabilityPage = () => <PageWrapper title="Manage Availability">Availability management here...</PageWrapper>;
const ReportsPage = () => <PageWrapper title="Reports">Reports content here...</PageWrapper>;
const LogsPage = () => <PageWrapper title="User Logs">User logs and activity here...</PageWrapper>;
const SettingsPage = () => <PageWrapper title="Settings">Settings page content...</PageWrapper>;

const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const location = useLocation();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">{title}</h2>
      <div className="bg-white p-6 rounded shadow min-h-[400px]">{children}</div>
      <p className="mt-6 text-sm text-gray-500">Current Path: {location.pathname}</p>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [notifications] = useState([
    { id: 1, message: 'Blackout date approaching: 2025-08-15' },
    { id: 2, message: 'Room 203 under maintenance' },
  ]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white">
        <header className="bg-[#00b2a7] text-white p-5 shadow-md flex justify-between items-center">
          <h1 className="text-3xl font-extrabold">Institution Admin Panel</h1>
          <div className="relative cursor-pointer" title="Notifications">
            <span className="material-icons select-none">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full animate-pulse">
                {notifications.length}
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-white border-r p-6 shadow-sm overflow-auto">
            <h2 className="text-xl font-bold mb-8 text-[#00b2a7]">Navigation</h2>
            <nav className="space-y-4">
              <SidebarLink label="Dashboard" to="/" />
              <SidebarLink label="Manage Rooms" to="/admin/rooms" />
              <SidebarLink label="View & Approve Bookings" to="/admin/bookings" />
              <SidebarLink label="Reports" to="/admin/reports" />
              <SidebarLink label="User Logs" to="/admin/logs" />
              <SidebarLink label="Settings" to="/admin/settings" />
            </nav>
          </aside>

          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/rooms" element={<RoomsPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/logs" element={<LogsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route
                path="*"
                element={
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold">404 - Page Not Found</h2>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>

        <footer className="bg-black text-white text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Institution Name. All rights reserved.
        </footer>
      </div>
    </Router>
  );
};

type SidebarLinkProps = {
  label: string;
  to: string;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded font-medium transition ${
        isActive ? 'bg-[#00b2a7] text-white' : 'hover:bg-[#00b2a7] hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
};

type CardProps = {
  title: string;
  value: string;
  color?: string;
  bgColor?: string;
  subtitle?: string;
  shadow?: boolean;
};

const DashboardCard: React.FC<CardProps> = ({
  title,
  value,
  color = 'text-gray-800',
  bgColor = 'bg-white',
  subtitle,
  shadow = false,
}) => (
  <div className={`${bgColor} border rounded p-5 text-center ${shadow ? 'shadow-lg' : 'shadow'}`}>
    <h3 className="text-md font-medium mb-2">{title}</h3>
    <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export default AdminDashboard;
