import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { GraduationCap, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Login failed. Check credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex flex-col items-center">
          <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to Campus Connect</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@school.edu" className="block w-full px-3 py-3 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Your password" className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role (optional)</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button disabled={loading} type="submit" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all">
            <span>{loading ? 'Signing in...' : 'Access Dashboard'}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <div className="text-center mt-3">
            <a href="#/signup" className="text-sm text-indigo-600 hover:underline">Don't have an account? Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
};