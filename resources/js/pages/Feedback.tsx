import React from 'react';

const feedbackData = [
  {
    id: 1,
    userId: 'U1023',
    userType: 'Student',
    email: 'student1@apiit.lk',
    message: 'The room booking feature isn’t working properly.',
    date: '2025-07-30',
  },
  {
    id: 2,
    userId: 'L2088',
    userType: 'Lecturer',
    email: 'lecturer1@apiit.lk',
    message: 'Can we have a notification system for upcoming bookings?',
    date: '2025-07-28',
  },
];

const FeedbackPage: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-[#00b2a7]">User Feedback & Support</h2>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-[#00b2a7] text-white">
            <th className="py-2 px-4">User ID</th>
            <th className="py-2 px-4">User Type</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Message</th>
            <th className="py-2 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {feedbackData.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{item.userId}</td>
              <td className="py-2 px-4">{item.userType}</td>
              <td className="py-2 px-4">{item.email}</td>
              <td className="py-2 px-4">{item.message}</td>
              <td className="py-2 px-4">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackPage;
