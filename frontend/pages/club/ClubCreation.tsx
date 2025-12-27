import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, CheckCircle } from 'lucide-react';

export const ClubCreation: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    clubName: '',
    clubEmail: '',
    clubDescription: '',
    membersCount: 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = (user as any)?.token;
      const response = await fetch('http://localhost:4200/club/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit club request');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting club request:', err);
      alert(err instanceof Error ? err.message : 'Error submitting club request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={48} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Club Request Submitted!</h3>
        <p className="text-gray-500 max-w-sm mt-2">
            Your club creation request has been sent to the Admin for approval. You will be notified once it's approved.
        </p>
        <button 
            onClick={() => { setSubmitted(false); setFormData({clubName: '', clubEmail: '', clubDescription: '', membersCount: 0}); }}
            className="mt-6 text-blue-600 font-medium hover:underline"
        >
            Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Club</h2>
        <p className="text-gray-500">Submit club details for administration review.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Club Name *</label>
          <input
            required
            type="text"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.clubName}
            onChange={e => setFormData({...formData, clubName: e.target.value})}
            placeholder="e.g., Computer Science Club"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Club Email</label>
          <input
            type="email"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.clubEmail}
            onChange={e => setFormData({...formData, clubEmail: e.target.value})}
            placeholder="club@university.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.clubDescription}
            onChange={e => setFormData({...formData, clubDescription: e.target.value})}
            placeholder="Describe the club's purpose, activities, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Initial Members Count</label>
          <input
            type="number"
            min="0"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.membersCount}
            onChange={e => setFormData({...formData, membersCount: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            <Send size={18} />
            <span>{loading ? 'Submitting...' : 'Submit Club Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};