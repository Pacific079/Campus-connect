import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const PendingApprovals: React.FC = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    if (!user || (user as any).role !== 'admin') {
      return;
    }
    setLoading(true);
    try {
      const token = (user as any).token;
      const res = await fetch('http://localhost:4200/user/pending-approvals', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        console.error('Failed to fetch pending users');
        setPendingUsers([]);
      } else {
        const data = await res.json();
        setPendingUsers(Array.isArray(data.pendingUsers) ? data.pendingUsers : []);
      }
    } catch (err) {
      console.error('fetch pending users error', err);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      const token = (user as any).token;
      const res = await fetch(`http://localhost:4200/user/approve/${userId}`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        alert('Failed to approve user');
        setApprovingId(null);
        return;
      }
      alert('User approved successfully!');
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
    } catch (err) {
      console.error('approve error', err);
      alert('Error approving user');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this user?')) {
      return;
    }
    setRejectingId(userId);
    try {
      const token = (user as any).token;
      const res = await fetch(`http://localhost:4200/user/reject/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        alert('Failed to reject user');
        setRejectingId(null);
        return;
      }
      alert('User rejected and deleted');
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
    } catch (err) {
      console.error('reject error', err);
      alert('Error rejecting user');
    } finally {
      setRejectingId(null);
    }
  };

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">Access denied. Only admins can view pending approvals.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Pending User Approvals</h1>
        <button
          onClick={fetchPendingUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          ✓ No pending approvals. All users are approved!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Institute Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u: any) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.instituteName || '–'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.phone || '–'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {u.role || 'student'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '–'}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(u._id)}
                      disabled={approvingId === u._id || rejectingId === u._id}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {approvingId === u._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(u._id)}
                      disabled={approvingId === u._id || rejectingId === u._id}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {rejectingId === u._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
