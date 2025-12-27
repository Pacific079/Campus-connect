import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Club {
  _id: string;
  userId: string;
  clubName: string;
  clubEmail: string;
  clubDescription: string;
  membersCount: number;
  createdAt: string;
}

const ClubApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingClubs();
  }, []);

  const fetchPendingClubs = async () => {
    try {
      setLoading(true);
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const token = session.token;
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:4200/club/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending clubs');
      const data = await response.json();
      setClubs(data.clubs || []);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError(err instanceof Error ? err.message : 'Error fetching clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (clubId: string) => {
    try {
      setActionLoading(clubId);
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const token = session.token;
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:4200/club/approve/${clubId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to approve club');
      setClubs(clubs.filter(c => c._id !== clubId));
    } catch (err) {
      console.error('Error approving club:', err);
      alert(err instanceof Error ? err.message : 'Error approving club');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (clubId: string) => {
    try {
      setActionLoading(clubId);
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const token = session.token;
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:4200/club/reject/${clubId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to reject club');
      setClubs(clubs.filter(c => c._id !== clubId));
    } catch (err) {
      console.error('Error rejecting club:', err);
      alert(err instanceof Error ? err.message : 'Error rejecting club');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Club Approvals</h1>
      
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {clubs.length === 0 ? (
        <div className="p-4 bg-blue-100 text-blue-700 rounded">No pending clubs for approval</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-4 py-2 text-left">Club Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-left">Members</th>
                <th className="border px-4 py-2 text-left">Submitted</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club._id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{club.clubName}</td>
                  <td className="border px-4 py-2">{club.clubEmail || 'N/A'}</td>
                  <td className="border px-4 py-2">{club.clubDescription || 'N/A'}</td>
                  <td className="border px-4 py-2">{club.membersCount || 0}</td>
                  <td className="border px-4 py-2">{new Date(club.createdAt).toLocaleDateString()}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleApprove(club._id)}
                      disabled={actionLoading === club._id}
                      className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === club._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(club._id)}
                      disabled={actionLoading === club._id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === club._id ? 'Processing...' : 'Reject'}
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

export default ClubApprovals;
