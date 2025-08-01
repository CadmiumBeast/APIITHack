import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import * as Select from '@radix-ui/react-select';
import * as Dialog from '@radix-ui/react-dialog';

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#00b2a7', '#FFBB28', '#FF8042', '#8884d8'];

interface Statistics {
  total_rooms: number;
  pending_approvals: number;
  this_month_bookings: number;
}

interface Location {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  building: string;
  level: string;
  venue_type: string;
  lecturer_name: string;
  lecturer_email: string;
  start_time: string;
  end_time: string;
  booking_date: string;
}

interface Props {
  statistics: Statistics;
  locations: Location[];
  today_bookings: any[];
}

const DashboardPage: React.FC<Props> = ({ statistics, locations, today_bookings }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Fetch bookings when date or location changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate, selectedLocation]);

  const fetchBookings = async () => {
    if (!selectedDate) return;

    setLoadingBookings(true);
    try {
      const response = await fetch('/admin/bookings/by-date-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          location_id: selectedLocation === 'all' ? null : selectedLocation
        })
      });

      const result = await response.json();
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const response = await fetch(`/admin/bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const result = await response.json();
      if (result.success) {
        // Remove the deleted booking from the list
        setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
        setDeleteModalOpen(false);
        setBookingToDelete(null);
        alert('Booking deleted successfully!');
      } else {
        alert('Error deleting booking: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    }
  };

  const todayBookingData = [
    { name: 'Booked', value: today_bookings.length },
    { name: 'Canceled', value: 0 },
    { name: 'Completed', value: 0 },
    { name: 'No Shows', value: 0 },
  ];

  const monthlyBookingData = [
    { month: 'Jan', bookings: 50 },
    { month: 'Feb', bookings: 70 },
    { month: 'Mar', bookings: 40 },
    { month: 'Apr', bookings: 80 },
    { month: 'May', bookings: 65 },
    { month: 'Jun', bookings: 90 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 md:px-8 py-6">
      <Head title="Admin Dashboard" />
      
      {/* Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12">
        <DashboardCard title="Total Rooms" value={statistics.total_rooms.toString()} color="text-[#00b2a7]" />
        <DashboardCard title="Pending Approvals" value={statistics.pending_approvals.toString()} color="text-yellow-500" />
        <DashboardCard title="Total Bookings (This Month)" value={statistics.this_month_bookings.toString()} color="text-green-600" />
      </section>

      {/* Date and Building Selection */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Select a Date Section (Left) */}
        <section className="bg-white p-6 rounded shadow-md w-full lg:w-1/3">
          <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">Select a Date</h3>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
          />
        </section>

        {/* Building Selection */}
        <section className="bg-white p-6 rounded shadow-md w-full lg:w-1/3">
          <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">Select Building</h3>
          <Select.Root value={selectedLocation} onValueChange={setSelectedLocation}>
            <Select.Trigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <Select.Value />
              <Select.Icon className="ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <Select.Viewport className="p-1">
                  <Select.Item value="all" className="relative select-none px-3 py-2 text-sm rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none">
                    <Select.ItemText>All Buildings</Select.ItemText>
                  </Select.Item>
                  {locations.map((location) => (
                    <Select.Item
                      key={location.id}
                      value={location.id.toString()}
                      className="relative select-none px-3 py-2 text-sm rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none"
                    >
                      <Select.ItemText>{location.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </section>

        {/* Quick Stats */}
        <section className="bg-white p-6 rounded shadow-md w-full lg:w-1/3">
          <h3 className="text-xl font-semibold mb-4 text-[#00b2a7]">
            Bookings for {selectedDate?.toLocaleDateString()}
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#00b2a7]">{bookings.length}</p>
            <p className="text-gray-600">Total Bookings</p>
          </div>
        </section>
      </div>

      {/* Bookings Sheet */}
      <section className="bg-white p-6 rounded shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#00b2a7]">
            Booking Schedule - {selectedDate?.toLocaleDateString()}
            {selectedLocation !== 'all' && ` - ${locations.find(l => l.id.toString() === selectedLocation)?.name}`}
          </h3>
          {loadingBookings && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {loadingBookings ? 'Loading bookings...' : 'No bookings found for selected date and building'}
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.start_time} - {booking.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.room_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.building}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.venue_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{booking.lecturer_name}</div>
                        <div className="text-gray-500">{booking.lecturer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setBookingToDelete(booking);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">
              Confirm Delete Booking
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete this booking for {bookingToDelete?.lecturer_name} in {bookingToDelete?.room_name}? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end space-x-3">
              <Dialog.Close asChild>
                <button 
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setBookingToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleDeleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Booking
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* <section className="flex flex-col lg:flex-row gap-8">
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
      </section> */}
    </div>
  );
};

const AdminDashboard: React.FC<Props> = ({ statistics, locations, today_bookings }) => {
  return (
    <AdminLayout>
      <DashboardPage 
        statistics={statistics}
        locations={locations}
        today_bookings={today_bookings}
      />
    </AdminLayout>
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
