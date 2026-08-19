import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { AdminProducts } from './pages/AdminProducts';
import { ProductForm } from './pages/ProductForm';
import { AdminOrders } from './pages/AdminOrders';
import { OrderDetailsView } from './pages/OrderDetailsView';
import { AdminPaymentVerification } from './pages/AdminPaymentVerification';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminSettings } from './pages/AdminSettings';
import { AdminNotificationLogs } from './pages/AdminNotificationLogs';
import { AdminInventory } from './pages/AdminInventory';
import { AdminCoupons } from './pages/AdminCoupons';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div className="min-h-screen bg-[#0c0a17] text-white flex items-center justify-center">Loading...</div>;
  if (!admin || admin.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminProducts />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/products/new"
              element={
                <AdminProtectedRoute>
                  <ProductForm />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminProtectedRoute>
                  <ProductForm />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <AdminProtectedRoute>
                  <AdminOrders />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/orders/:id"
              element={
                <AdminProtectedRoute>
                  <OrderDetailsView />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/payments"
              element={
                <AdminProtectedRoute>
                  <AdminPaymentVerification />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/customers"
              element={
                <AdminProtectedRoute>
                  <AdminCustomers />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/inventory"
              element={
                <AdminProtectedRoute>
                  <AdminInventory />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/coupons"
              element={
                <AdminProtectedRoute>
                  <AdminCoupons />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute>
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/notifications"
              element={
                <AdminProtectedRoute>
                  <AdminNotificationLogs />
                </AdminProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
