import React, { PropsWithChildren, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SyllabusMap } from './pages/student/SyllabusMap';
import { HallTicket } from './pages/student/HallTicket';
import { Signup } from './pages/student/Signup';
import SignupUser from './pages/SignupUser';
import { SeatingManager } from './pages/seating/SeatingManager';
import { StudentDetails } from './pages/seating/StudentDetails';
import { EventProposal } from './pages/club/EventProposal';
import { ClubCreation } from './pages/club/ClubCreation';
import { PendingApprovals } from './pages/admin/PendingApprovals';
import ClubApprovals from './pages/admin/ClubApprovals';
import EventManager from './pages/admin/EventManager';
import { SyllabusManager } from './pages/admin/SyllabusManager';
import { CalendarPage } from './pages/CalendarPage';

const PrivateRoute = ({ children }: PropsWithChildren) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-10 text-center text-gray-500">Loading session...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const ApiKeyGate = ({ children }: PropsWithChildren) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // If window.aistudio is available, we must use it
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Failed to check API key status", e);
          setHasKey(false);
        }
      } else {
        // Fallback for local development or non-AI-Studio environments
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // Assume success after dialog close/interaction, or re-check
        // To be safe, we just set true to unblock the UI. 
        // Real validation happens when API calls are made.
        setHasKey(true); 
      } catch (e) {
        console.error("Failed to open key selector", e);
        // If "Requested entity was not found" or other error, prompt again.
        setHasKey(false);
      }
    }
  };

  if (hasKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <Key className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Required</h2>
          <p className="text-gray-600 mb-8">
            To use the advanced AI features of Campus Connect, please select a valid Google Cloud Project API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md focus:ring-4 focus:ring-indigo-200"
          >
            Select API Key
          </button>
          <p className="mt-6 text-xs text-gray-400">
            Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Gemini API Billing</a> for more info.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* Student Routes */}
      <Route path="/syllabus" element={<PrivateRoute><SyllabusMap /></PrivateRoute>} />
      <Route path="/hall-ticket" element={<PrivateRoute><HallTicket /></PrivateRoute>} />
      <Route path="/student/signup" element={<Signup />} />
      <Route path="/signup" element={<SignupUser />} />
      <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
      {/* Seating Manager Routes */}
      <Route path="/seating" element={<PrivateRoute><SeatingManager /></PrivateRoute>} />
      <Route path="/seating/students-details" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
      
      {/* Club Routes */}
      <Route path="/club/propose" element={<PrivateRoute><EventProposal /></PrivateRoute>} />
      <Route path="/club/create" element={<PrivateRoute><ClubCreation /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/pending-approvals" element={<PrivateRoute><PendingApprovals /></PrivateRoute>} />
      <Route path="/admin/club-approvals" element={<PrivateRoute><ClubApprovals /></PrivateRoute>} />
      <Route path="/admin/events" element={<PrivateRoute><EventManager /></PrivateRoute>} />
      <Route path="/admin/syllabus" element={<PrivateRoute><SyllabusManager /></PrivateRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ApiKeyGate>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ApiKeyGate>
  );
};

export default App;