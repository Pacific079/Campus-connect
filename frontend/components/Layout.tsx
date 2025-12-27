import React, { useState, PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { 
  LogOut, 
  Menu, 
  X, 
  BookOpen, 
  Calendar, 
  Grid, 
  Users, 
  FileText,
  LayoutDashboard
} from 'lucide-react';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const getNavItems = () => {
    const common = [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '#/' },
      { icon: <Calendar size={20} />, label: 'Calendar', path: '#/calendar' },
    ];

    switch (user.role) {
      case UserRole.STUDENT:
        return [
          ...common,
          { icon: <FileText size={20} />, label: 'Hall Ticket', path: '#/hall-ticket' },
          { icon: <BookOpen size={20} />, label: 'Syllabus & AI', path: '#/syllabus' },
          { icon: <BookOpen size={20} />, label: 'Register', path: '#/student/signup' },
        ];
      case UserRole.ADMIN:
        return [
          ...common,
          { icon: <Users size={20} />, label: 'Pending Approvals', path: '#/admin/pending-approvals' },
          { icon: <Users size={20} />, label: 'Club Approvals', path: '#/admin/club-approvals' },
          { icon: <Users size={20} />, label: 'Manage Events', path: '#/admin/events' },
          { icon: <BookOpen size={20} />, label: 'Upload Syllabus', path: '#/admin/syllabus' },
        ];
      case UserRole.SEATING_MANAGER:
        return [
          ...common,
          { icon: <Grid size={20} />, label: 'Seating Plan', path: '#/seating' },
          { icon: <Users size={20} />, label: 'Students Details', path: '#/seating/students-details' },
        ];
      case UserRole.CLUB_COORDINATOR:
        return [
          ...common,
          { icon: <Users size={20} />, label: 'Create Club', path: '#/club/create' },
          { icon: <Users size={20} />, label: 'Club Events', path: '#/club/propose' },
        ];
      default:
        return common;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Campus Connect
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {getNavItems().map((item, idx) => (
            <a 
              key={idx} 
              href={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Campus Connect</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-16 px-4">
           <nav className="space-y-4">
            {getNavItems().map((item, idx) => (
              <a 
                key={idx} 
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800 text-white"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
             <button 
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg bg-red-500/20 text-red-400"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-y-auto h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};