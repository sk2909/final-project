import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleUpdates, setRoleUpdates] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8090/api/admin/users', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setRoleUpdates(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleAssignRole = async (userId) => {
    const newRole = roleUpdates[userId];
    if (!newRole) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8090/api/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to assign role');
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setRoleUpdates(prev => ({ ...prev, [userId]: undefined }));
    } catch (err) {
      alert('Failed to assign role');
    }
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">User Management</h1>
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.username || <span className='text-gray-400 italic'>N/A</span>}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold mr-2">{user.role}</span>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={roleUpdates[user.id] || user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="STUDENT">STUDENT</option>
                        <option value="EXAMINER">EXAMINER</option>
                      </select>
                      <button
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        onClick={() => handleAssignRole(user.id)}
                        disabled={!roleUpdates[user.id] || roleUpdates[user.id] === user.role}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageUsersPage;
