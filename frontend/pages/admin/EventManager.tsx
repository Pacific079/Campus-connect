import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  type: 'exam' | 'holiday' | 'event' | 'deadline';
  createdAt: string;
}

const EventManager: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'event' as const,
  });

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4200/event/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setActionLoading(true);
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const token = session.token;
      if (!token) {
        navigate('/login');
        return;
      }

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
          type: formData.type.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.msg || 'Failed to create event');
      }
      const data = await response.json();
      setEvents([...events, data.event]);
      setFormData({ title: '', description: '', date: '', type: 'event' });
      alert('Event created successfully');
    } catch (err) {
      console.error('Error creating event:', err);
      alert(err instanceof Error ? err.message : 'Error creating event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const token = session.token;
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:4200/event/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err instanceof Error ? err.message : 'Error deleting event');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Event Manager</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Add Event Form */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Event title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Event description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? 'Creating...' : 'Add Event'}
          </button>
        </form>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-4 border-b">Upcoming Events</h2>
        {events.length === 0 ? (
          <div className="p-4 text-gray-600">No events scheduled yet</div>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <div key={event._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(event.type)}`}>
                        {event.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <p className="text-sm text-gray-500">
                      📅 {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManager;
