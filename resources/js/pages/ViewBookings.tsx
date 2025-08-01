import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';

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
  bookings: Booking[];
}

export default function ViewBookings({ bookings }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);

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
        setLocalBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 px-4 md:px-8 py-6">
        <Head title="View Bookings" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">Manage and view all classroom bookings</p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Booking Records</h2>
            <p className="text-sm text-gray-600 mt-1">Total bookings: {localBookings.length}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  localBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.booking_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.room_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.building}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.venue_type}
                      </td>
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
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 max-w-md w-full mx-4">
              <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">
                Confirm Delete Booking
              </Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-6">
                Are you sure you want to delete this booking for {bookingToDelete?.lecturer_name} in {bookingToDelete?.room_name} on {bookingToDelete ? formatDate(bookingToDelete.booking_date) : ''}? This action cannot be undone.
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
      </div>
    </AdminLayout>
  );
}
