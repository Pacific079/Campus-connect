import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User } from '../types';
import { db } from '../services/mockDb';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session
    const stored = localStorage.getItem('user_session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      // Call real backend login
      const res = await fetch('http://localhost:4200/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const session = {
        id: data._id,
        name: data.instituteName || data.email,
        email: data.email,
        role: data.role || 'student',
        avatar: data.imageUrl,
        token: data.token,
      };
      setUser(session);
      localStorage.setItem('user_session', JSON.stringify(session));
      return true;
    } catch (err) {
      console.error('login error', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};