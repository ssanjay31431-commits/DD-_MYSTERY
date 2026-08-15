import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Common Layout Elements
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Customer Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { CustomizeBox } from './pages/CustomizeBox';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { PaymentPage } from './pages/PaymentPage';
import { OrderSuccess } from './pages/OrderSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { MyOrders } from './pages/MyOrders';
import { OrderDetails } from './pages/OrderDetails';
import { SavedAddresses } from './pages/SavedAddresses';
import { MyNotifications } from './pages/MyNotifications';
import { WishlistPage } from './pages/WishlistPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FAQ } from './pages/FAQ';
import { ContactUs } from './pages/ContactUs';
import { PrivacyPolicy, TermsAndConditions, RefundPolicy } from './pages/Policies';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminThemes } from './pages/admin/AdminThemes';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminRewards } from './pages/admin/AdminRewards';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminNotificationLogs } from './pages/admin/AdminNotificationLogs';

function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f0c1b] text-slate-100">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
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
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
