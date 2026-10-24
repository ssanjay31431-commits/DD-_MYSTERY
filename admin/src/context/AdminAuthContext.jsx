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
    let active = true;
    const token = localStorage.getItem('dd_admin_token');

    const clearAdminSession = () => {
      localStorage.removeItem('dd_admin_user');
      localStorage.removeItem('dd_admin_token');
      setAdmin(null);
    };

    const handleAuthLogout = () => setAdmin(null);
    window.addEventListener('auth_logout', handleAuthLogout);

    if (!token) {
      localStorage.removeItem('dd_admin_user');
      setLoading(false);
      return () => window.removeEventListener('auth_logout', handleAuthLogout);
    }

    API.get('/auth/profile')
      .then(({ data }) => {
        if (!active) return;
        if (data?.role !== 'admin') {
          clearAdminSession();
          return;
        }

        const authenticatedAdmin = {
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          profileImage: data.profileImage,
          role: data.role
        };
        setAdmin(authenticatedAdmin);
        localStorage.setItem('dd_admin_user', JSON.stringify(authenticatedAdmin));
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          clearAdminSession();
        } else {
          setAdmin(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener('auth_logout', handleAuthLogout);
    };
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.role !== 'admin' || !data.token) {
        throw new Error('This account does not have administrator access.');
      }

      const { token, ...authenticatedAdmin } = data;
      setAdmin(authenticatedAdmin);
      localStorage.setItem('dd_admin_user', JSON.stringify(authenticatedAdmin));
      localStorage.setItem('dd_admin_token', data.token);

      addToast(`Welcome to Admin Control Center, ${authenticatedAdmin.name}! 🛡️`);
      return authenticatedAdmin;
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
