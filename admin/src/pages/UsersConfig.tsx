import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, UserX, UserCheck, Search, Loader2 } from 'lucide-react';

export const UsersConfig: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve auth token
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin users table:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateState = async (userId: string, payload: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        // Reload table
        fetchUsers();
      } else {
        alert('Action forbidden: Insufficient admin permissions.');
      }
    } catch (err) {
      alert('Network request error.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Resolving user accounts matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Modify roles, configure RBAC permissions, and toggle ban/suspension states.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex gap-2 items-center bg-card p-4 border rounded-2xl shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts by name or email..."
          className="flex-grow bg-transparent outline-none text-sm font-semibold"
        />
      </div>

      {/* Users table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40 border-b font-bold text-muted-foreground">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">System Role</th>
              <th className="p-4">Admin Hub Privilege</th>
              <th className="p-4">Access Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y font-semibold">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-muted/20">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateState(user._id, { role: e.target.value })}
                    className="bg-secondary/50 border rounded-lg px-2.5 py-1 text-xs outline-none font-bold"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={user.adminRole || 'user'}
                    onChange={(e) => handleUpdateState(user._id, { adminRole: e.target.value })}
                    className="bg-secondary/50 border rounded-lg px-2.5 py-1 text-xs outline-none font-bold"
                  >
                    <option value="user">User Role</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">General Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Customer Support</option>
                    <option value="marketing">Marketing Manager</option>
                    <option value="finance">Finance Manager</option>
                    <option value="viewer">Analytics Viewer</option>
                  </select>
                </td>
                <td className="p-4">
                  {user.isBanned ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400">
                      Banned
                    </span>
                  ) : user.isSuspended ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400">
                      Active
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {/* Suspend Toggle */}
                    <button
                      onClick={() =>
                        handleUpdateState(user._id, { isSuspended: !user.isSuspended })
                      }
                      className="p-1.5 border rounded-lg hover:bg-muted transition"
                      title="Toggle Suspend"
                    >
                      {user.isSuspended ? (
                        <UserCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <UserX className="w-4 h-4 text-amber-500" />
                      )}
                    </button>
                    {/* Ban Toggle */}
                    <button
                      onClick={() => handleUpdateState(user._id, { isBanned: !user.isBanned })}
                      className="p-1.5 border rounded-lg hover:bg-muted transition"
                      title="Toggle Ban"
                    >
                      {user.isBanned ? (
                        <Shield className="w-4 h-4 text-green-500" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UsersConfig;
