import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ScrollToTop } from './components/ScrollToTop';

const AdminLogin = lazy(() => import('./pages/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const AdminProducts = lazy(() => import('./pages/AdminProducts').then((module) => ({ default: module.AdminProducts })));
const ProductForm = lazy(() => import('./pages/ProductForm').then((module) => ({ default: module.ProductForm })));
const AdminOrders = lazy(() => import('./pages/AdminOrders').then((module) => ({ default: module.AdminOrders })));
const OrderDetailsView = lazy(() => import('./pages/OrderDetailsView').then((module) => ({ default: module.OrderDetailsView })));
const AdminPaymentVerification = lazy(() => import('./pages/AdminPaymentVerification').then((module) => ({ default: module.AdminPaymentVerification })));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers').then((module) => ({ default: module.AdminCustomers })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then((module) => ({ default: module.AdminSettings })));
const AdminNotificationLogs = lazy(() => import('./pages/AdminNotificationLogs').then((module) => ({ default: module.AdminNotificationLogs })));
const AdminInventory = lazy(() => import('./pages/AdminInventory').then((module) => ({ default: module.AdminInventory })));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons').then((module) => ({ default: module.AdminCoupons })));

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
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm font-bold text-slate-300">Loading page...</div>}>
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
          </Suspense>
        </Router>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
