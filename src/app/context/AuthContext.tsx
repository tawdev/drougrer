'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api, type Order } from '../lib/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Create a temporary fetch to verify the profile
      const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
      const response = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        });
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't logout on network error, just stop loading
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'strict' });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      login, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
