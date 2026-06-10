import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminUserVerification() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      const users = res.data.users || [];
      setUnverifiedUsers(users.filter((u) => !u.verified));
      setVerifiedUsers(users.filter((u) => u.verified));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success('User verified');
      fetchUsers();
    } catch {
      toast.error('Failed to verify user');
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      toast.success('User suspended');
      fetchUsers();
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const roleBadge = (role) => {
    const styles = {
      patient: 'bg-primary-100 text-primary-700',
      doctor: 'bg-accent-100 text-accent-700',
      engineer: 'bg-purple-100 text-purple-700',
      admin: 'bg-yellow-100 text-yellow-700',
    };
    return styles[role] || 'bg-gray-100 text-gray-600';
  };

  const UserTable = ({ users, showVerify, showSuspend }) => (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {showVerify && (
                    <Button size="sm" variant="primary" onClick={() => handleVerify(user.id)}>
                      Verify
                    </Button>
                  )}
                  {showSuspend && !user.suspended && (
                    <Button size="sm" variant="danger" onClick={() => handleSuspend(user.id)}>
                      Suspend
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">User Verification</h1>

          {loading ? (
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Unverified Users ({unverifiedUsers.length})
                </h2>
                {unverifiedUsers.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                    All users verified
                  </div>
                ) : (
                  <UserTable users={unverifiedUsers} showVerify />
                )}
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Verified Users ({verifiedUsers.length})
                </h2>
                {verifiedUsers.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No verified users
                  </div>
                ) : (
                  <UserTable users={verifiedUsers} showSuspend />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
