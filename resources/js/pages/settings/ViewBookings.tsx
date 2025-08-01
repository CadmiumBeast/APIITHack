import React, { useState } from 'react';

type Booking = {
  id: number;
  requesterName: string;
  requesterType: 'Student' | 'Lecturer';
  room: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string;
  status: 'Pending' | 'Approved' | 'Declined';
};

const initialBookings: Booking[] = [
  {
    id: 1,
    requesterName: 'Alice Johnson',
    requesterType: 'Student',
    room: 'L4CR4',
    date: '2025-08-05',
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'Pending',
  },
  {
    id: 2,
    requesterName: 'Dr. Smith',
    requesterType: 'Lecturer',
    room: 'L5CR4',
    date: '2025-08-06',
    timeSlot: '2:00 PM - 3:00 PM',
    status: 'Pending',
  },
];

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const updateBookingStatus = (id: number, newStatus: 'Approved' | 'Declined') => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: newStatus } : booking
      )
    );
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-[#00b2a7]">
        View & Approve Bookings
      </h2>

      {bookings.length === 0 ? (
        <p>No booking requests available.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#00b2a7] text-white">
              <th className="border border-gray-300 px-4 py-2">Requester</th>
              <th className="border border-gray-300 px-4 py-2">Type</th>
              <th className="border border-gray-300 px-4 py-2">Room</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Time Slot</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{booking.requesterName}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.requesterType}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.room}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.date}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.timeSlot}</td>
                <td
                  className={`border border-gray-300 px-4 py-2 font-semibold ${
                    booking.status === 'Approved'
                      ? 'text-green-600'
                      : booking.status === 'Declined'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {booking.status}
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  {booking.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Approved')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Declined')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className="italic text-gray-500">Action completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingsPage;