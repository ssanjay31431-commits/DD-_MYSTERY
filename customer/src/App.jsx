import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Common Layout Elements
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Shop = lazy(() => import('./pages/Shop').then((module) => ({ default: module.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then((module) => ({ default: module.ProductDetails })));
const CustomizeBox = lazy(() => import('./pages/CustomizeBox').then((module) => ({ default: module.CustomizeBox })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then((module) => ({ default: module.PaymentPage })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then((module) => ({ default: module.OrderSuccess })));
const TrackOrder = lazy(() => import('./pages/TrackOrder').then((module) => ({ default: module.TrackOrder })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then((module) => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((module) => ({ default: module.ForgotPassword })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const MyOrders = lazy(() => import('./pages/MyOrders').then((module) => ({ default: module.MyOrders })));
const OrderDetails = lazy(() => import('./pages/OrderDetails').then((module) => ({ default: module.OrderDetails })));
const SavedAddresses = lazy(() => import('./pages/SavedAddresses').then((module) => ({ default: module.SavedAddresses })));
const MyNotifications = lazy(() => import('./pages/MyNotifications').then((module) => ({ default: module.MyNotifications })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then((module) => ({ default: module.ReviewsPage })));
const FAQ = lazy(() => import('./pages/FAQ').then((module) => ({ default: module.FAQ })));
const ContactUs = lazy(() => import('./pages/ContactUs').then((module) => ({ default: module.ContactUs })));
const PrivacyPolicy = lazy(() => import('./pages/Policies').then((module) => ({ default: module.PrivacyPolicy })));
const TermsAndConditions = lazy(() => import('./pages/Policies').then((module) => ({ default: module.TermsAndConditions })));
const RefundPolicy = lazy(() => import('./pages/Policies').then((module) => ({ default: module.RefundPolicy })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then((module) => ({ default: module.MaintenancePage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then((module) => ({ default: module.AdminOrders })));
const AdminPaymentVerification = lazy(() => import('./pages/admin/AdminPaymentVerification').then((module) => ({ default: module.AdminPaymentVerification })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then((module) => ({ default: module.AdminProducts })));
const AdminThemes = lazy(() => import('./pages/admin/AdminThemes').then((module) => ({ default: module.AdminThemes })));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory').then((module) => ({ default: module.AdminInventory })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then((module) => ({ default: module.AdminCustomers })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then((module) => ({ default: module.AdminCoupons })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then((module) => ({ default: module.AdminReviews })));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards').then((module) => ({ default: module.AdminRewards })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((module) => ({ default: module.AdminSettings })));
const AdminNotificationLogs = lazy(() => import('./pages/admin/AdminNotificationLogs').then((module) => ({ default: module.AdminNotificationLogs })));
import { MobileBottomNav } from './components/common/MobileBottomNav';

function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f0c1b] text-slate-100 overflow-x-clip">
      <Navbar />
      <main className="flex-grow pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm font-bold text-slate-300">Loading page...</div>}>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
                <Route path="/shop" element={<CustomerLayout><Shop /></CustomerLayout>} />
                <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
                <Route path="/customize/:productId" element={<CustomerLayout><CustomizeBox /></CustomerLayout>} />
                <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
                <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
                <Route path="/payment" element={<CustomerLayout><PaymentPage /></CustomerLayout>} />
                <Route path="/order-success/:orderId" element={<CustomerLayout><OrderSuccess /></CustomerLayout>} />
                <Route path="/track" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />
                <Route path="/track/:orderId" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />
                <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
                <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />
                <Route path="/forgot-password" element={<CustomerLayout><ForgotPassword /></CustomerLayout>} />
                
                {/* Protected Customer Routes */}
                <Route path="/profile" element={<ProtectedRoute><CustomerLayout><Profile /></CustomerLayout></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><CustomerLayout><MyOrders /></CustomerLayout></ProtectedRoute>} />
                <Route path="/order/:id" element={<ProtectedRoute><CustomerLayout><OrderDetails /></CustomerLayout></ProtectedRoute>} />
                <Route path="/saved-addresses" element={<ProtectedRoute><CustomerLayout><SavedAddresses /></CustomerLayout></ProtectedRoute>} />
                <Route path="/my-notifications" element={<ProtectedRoute><CustomerLayout><MyNotifications /></CustomerLayout></ProtectedRoute>} />

                <Route path="/wishlist" element={<CustomerLayout><WishlistPage /></CustomerLayout>} />
                <Route path="/reviews" element={<CustomerLayout><ReviewsPage /></CustomerLayout>} />
                <Route path="/faq" element={<CustomerLayout><FAQ /></CustomerLayout>} />
                <Route path="/contact" element={<CustomerLayout><ContactUs /></CustomerLayout>} />
                <Route path="/privacy-policy" element={<CustomerLayout><PrivacyPolicy /></CustomerLayout>} />
                <Route path="/terms-and-conditions" element={<CustomerLayout><TermsAndConditions /></CustomerLayout>} />
                <Route path="/refund-policy" element={<CustomerLayout><RefundPolicy /></CustomerLayout>} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPaymentVerification /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/themes" element={<ProtectedRoute adminOnly><AdminThemes /></ProtectedRoute>} />
                <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
                <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />
                <Route path="/admin/coupons" element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
                <Route path="/admin/rewards" element={<ProtectedRoute adminOnly><AdminRewards /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminNotificationLogs /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
              </Routes>
              </Suspense>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
