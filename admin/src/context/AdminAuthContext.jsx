import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AdminAuthContext = createContext({
  admin: null,
  loading: false,
  loginAdmin: async () => {},
  logoutAdmin: () => {}
});

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('dd_admin_user');
    const token = localStorage.getItem('dd_admin_token');

    if (storedAdmin && token) {
      try {
        const parsed = JSON.parse(storedAdmin);
        if (parsed.role === 'admin') {
          setAdmin(parsed);
        } else {
          localStorage.removeItem('dd_admin_user');
          localStorage.removeItem('dd_admin_token');
        }
      } catch (err) {
        localStorage.removeItem('dd_admin_user');
        localStorage.removeItem('dd_admin_token');
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        addToast('Access Denied: Customer accounts cannot access Admin Control Center', 'error');
        throw new Error('Not authorized as admin');
      }
      setAdmin(data);
      localStorage.setItem('dd_admin_user', JSON.stringify(data));
      localStorage.setItem('dd_admin_token', data.token);
      addToast(`Welcome to Admin Control Center, ${data.name}! 🛡️`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Admin login failed';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('dd_admin_user');
    localStorage.removeItem('dd_admin_token');
    addToast('Admin logged out successfully');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
