import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { db } from '../services/mockDb';
import { Clock, Calendar, Users, Award } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    activeExams: 0,
    attendance: '87%',
    pendingApprovals: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const token = (user as any).token;

      // Fetch registered exams (for exams count)
      const examsRes = await fetch('http://localhost:4200/student/registered-exams', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      }).catch(() => null);
      const examsData = examsRes?.ok ? await examsRes.json() : { exams: [] };

      // Fetch pending approvals (for admin dashboard)
      let pendingCount = 0;
      if ((user as any).role === 'admin') {
        const approvalsRes = await fetch('http://localhost:4200/user/pending-approvals', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        }).catch(() => null);
        const approvalsData = approvalsRes?.ok ? await approvalsRes.json() : { pendingUsers: [] };
        pendingCount = approvalsData.pendingUsers?.length || 0;
      }

      // Fetch events from API
      const eventsRes = await fetch('http://localhost:4200/event/all');
      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsRes.json();
      const now = new Date();
      const upcomingEvents = eventsData.events.filter((event: any) => new Date(event.date) >= now);

      setStats({
        upcomingEvents: upcomingEvents.length,
        activeExams: examsData.exams?.length || 0,
        attendance: '87%', // This would come from attendance API if available
        pendingApprovals: pendingCount,
      });
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('fetch dashboard data error', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  // Safe name access
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here is what is happening in your academic life.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents} 
          icon={Calendar} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Exams" 
          value={stats.activeExams} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        {user?.role === UserRole.STUDENT && (
           <StatCard 
           title="Attendance" 
           value={stats.attendance} 
           icon={Users} 
           color="bg-green-500" 
         />
        )}
         {user?.role === UserRole.ADMIN && (
           <StatCard 
           title="Pending Approvals" 
           value={stats.pendingApprovals} 
           icon={Award} 
           color="bg-purple-500" 
         />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Academic Calendar</h3>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-gray-400">No upcoming events.</p>
            ) : (
              events.map(event => (
                <div key={event._id} className="flex items-start p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 uppercase">{event.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Notice Board</h3>
          <ul className="space-y-3">
             <li className="text-sm text-gray-600 pb-3 border-b">
                <span className="font-medium text-red-500 block mb-1">Important</span>
                Final exam schedules have been released. Please download your hall ticket.
             </li>
             <li className="text-sm text-gray-600 pb-3 border-b">
                <span className="font-medium text-green-500 block mb-1">Club News</span>
                Robotics club registration closes this Friday.
             </li>
          </ul>
        </div>
      </div>
    </div>
  );
};