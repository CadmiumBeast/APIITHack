import React from 'react';

type User = {
  id: number;
  userType: 'Student' | 'Lecturer';
  email: string;
};

const users: User[] = [
  {
    id: 101,
    userType: 'Student',
    email: 'alice@student.university.edu',
  },
  {
    id: 102,
    userType: 'Lecturer',
    email: 'dr.smith@university.edu',
  },
  {
    id: 103,
    userType: 'Student',
    email: 'bob@student.university.edu',
  },
];

const LogsPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-[#00b2a7]">User Logs</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#00b2a7] text-white">
              <th className="border border-gray-300 px-4 py-2">User ID</th>
              <th className="border border-gray-300 px-4 py-2">User Type</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                <td className="border border-gray-300 px-4 py-2">{user.userType}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LogsPage;
