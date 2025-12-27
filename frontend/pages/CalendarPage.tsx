import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock } from 'lucide-react';

// Clean, professional calendar styles matching the project theme
const cleanCalendarStyles = `
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    font-family: inherit;
  }

  .react-calendar__navigation {
    background: #f9fafb;
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 12px 12px 0 0;
  }

  .react-calendar__navigation button {
    color: #374151;
    font-weight: 600;
    font-size: 14px;
    border: none;
    background: none;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .react-calendar__navigation button:hover {
    background: #e5e7eb;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background: #e5e7eb;
  }

  .react-calendar__month-view__weekdays {
    background: #f9fafb;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .react-calendar__month-view__weekdays__weekday {
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .react-calendar__tile {
    padding: 12px 8px;
    position: relative;
    background: none;
    color: #374151;
    border: none;
    transition: all 0.2s ease;
    border-radius: 6px;
    margin: 1px;
  }

  .react-calendar__tile:hover {
    background: #f3f4f6;
  }

  .react-calendar__tile--now {
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }

  .react-calendar__tile--active {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .react-calendar__tile--active:hover {
    background: #2563eb;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: #f3f4f6;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: #d1d5db;
  }

  .react-calendar__month-view__days__day--weekend {
    color: #374151;
  }

  .react-calendar__tile abbr {
    font-weight: 500;
  }
`;

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = cleanCalendarStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:4200/event/all');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });
      return dayEvents.length > 0 ? (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {dayEvents.slice(0, 3).map((event, idx) => (
            <div
              key={event._id}
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
              title={event.title}
            />
          ))}
          {dayEvents.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white leading-none">
              +
            </div>
          )}
        </div>
      ) : null;
    }
  };

  const selectedDateEvents = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Calendar</h1>
          <p className="text-gray-600 mt-2">View and manage your academic events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <CalendarComponent
                onChange={(value: any) => {
                  // Handle both single date and date range
                  if (Array.isArray(value)) {
                    setSelectedDate(value[0]);
                  } else if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                tileContent={tileContent}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 text-gray-500" size={20} />
              {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Select a date'}
            </h3>
            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm">No events scheduled</p>
                  <p className="text-xs text-gray-400 mt-1">Click on a date to view events</p>
                </div>
              ) : (
                selectedDateEvents.map(event => (
                  <div key={event._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {event.type}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock size={12} className="mr-1" />
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};