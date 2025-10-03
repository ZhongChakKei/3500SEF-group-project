import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { API_BASE } from '../../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on app load
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // If a backend API is configured, verify token is still valid by fetching profile
        if (API_BASE) {
          fetchProfile();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    if (!API_BASE) return; // No backend in frontend-only mode
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    // Frontend-only mode: simulate login
    if (!API_BASE) {
      const demoUser = {
        id: 'demo',
        email,
        name: email === 'admin@example.com' ? 'Admin User' : 'Demo User',
        role: email === 'admin@example.com' ? 'admin' : 'user',
      };
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { success: true, user: demoUser };
    }
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (email, password, name, role = 'user') => {
    // Frontend-only mode: simulate registration
    if (!API_BASE) {
      const demoUser = {
        id: 'demo',
        email,
        name: name || 'Demo User',
        role: role || 'user',
      };
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { success: true, user: demoUser };
    }
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name, 
        role 
      });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAuthenticated = () => {
    return !!user;
  };

  // Legacy demo login for backwards compatibility
  const loginDemo = (name = 'Demo User', roles = ['Admin']) => {
    const demoUser = { 
      name, 
      roles, 
      role: roles.includes('Admin') ? 'admin' : 'user',
      email: 'demo@example.com',
      id: 'demo'
    };
    setUser(demoUser);
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  const value = useMemo(() => ({ 
    user, 
    loading,
    login,
    register,
    logout, 
    loginDemo,
    isAdmin,
    isAuthenticated,
    fetchProfile
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
