import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, CheckCircle } from 'lucide-react';

export const EventProposal: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'event'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = (user as any)?.token;
      const response = await fetch('http://localhost:4200/event/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          type: formData.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit proposal');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting proposal:', err);
      alert(err instanceof Error ? err.message : 'Error submitting proposal');
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
        <h3 className="text-xl font-bold text-gray-800">Proposal Submitted!</h3>
        <p className="text-gray-500 max-w-sm mt-2">
            Your event has been sent to the Admin for approval. Once approved, it will appear on the global calendar.
        </p>
        <button 
            onClick={() => { setSubmitted(false); setFormData({title: '', description: '', date: '', type: 'club'}); }}
            className="mt-6 text-blue-600 font-medium hover:underline"
        >
            Submit Another Proposal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Propose New Event</h2>
        <p className="text-gray-500">Submit event details for administration review.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
          <input
            required
            type="text"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Annual Tech Symposium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            required
            rows={4}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Details about the event, expected attendance, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proposed Date</label>
          <input
            required
            type="date"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            <Send size={18} />
            <span>{loading ? 'Submitting...' : 'Submit Proposal'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
