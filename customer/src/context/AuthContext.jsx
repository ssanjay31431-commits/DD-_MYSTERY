import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('dd_user');
    const token = localStorage.getItem('dd_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('dd_user');
        localStorage.removeItem('dd_token');
        setUser(null);
      }
    } else {
      localStorage.removeItem('dd_user');
      localStorage.removeItem('dd_token');
      setUser(null);
    }
    setLoading(false);

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout', handleAuthLogout);
    return () => window.removeEventListener('auth_logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('dd_user', JSON.stringify(data));
      localStorage.setItem('dd_token', data.token);
      addToast(`Welcome back, ${data.name}! 🎁`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('dd_user', JSON.stringify(data));
      localStorage.setItem('dd_token', data.token);
      addToast(`Account created! Welcome to DD Mystery Box, ${data.name}!`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const { data } = await API.post('/auth/google', { credential });
      setUser(data);
      localStorage.setItem('dd_user', JSON.stringify(data));
      localStorage.setItem('dd_token', data.token);
      addToast(`Welcome to DD Mystery Box, ${data.name}! 🎁`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Google authentication failed';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dd_user');
    localStorage.removeItem('dd_token');
    addToast('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
