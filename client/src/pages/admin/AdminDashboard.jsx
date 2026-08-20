import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Clock, CheckCircle2, TrendingUp, Award, Eye, Shield, Trash2, Bell, X } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

const EMPTY_STATS = {
  totalRevenue: 0,
  todayRevenue: 0,
  totalOrders: 0,
  todayOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  totalCustomers: 0,
  averageOrderValue: 0,
  popularThemes: [],
  recentOrders: []
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCleared, setNotificationsCleared] = useState(() => {
    return Boolean(localStorage.getItem('dd_admin_notifs_cleared'));
  });

  const handleClearNotifications = () => {
    setNotificationsCleared(true);
    localStorage.setItem('dd_admin_notifs_cleared', 'true');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/dashboard');
      if (data && typeof data === 'object' && data.totalRevenue !== undefined && !data.message) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearAllData = async () => {
    if (!deleteConfirmText) {
      alert('Please enter the Admin Password to confirm data purge');
      return;
    }

    setDeletingAll(true);
    try {
      const { data } = await API.delete('/admin/clear-all-data', {
        data: { password: deleteConfirmText }
      });
      if (data && data.success) {
        alert('🚨 All store test orders, payments, screenshots & histories deleted successfully!');
        setShowDeleteModal(false);
        setDeleteConfirmText('');
        fetchStats();
      } else {
        alert(data?.message || 'Failed to clear data');
      }
    } catch (err) {
      console.error('Clear data error:', err);
      alert(err.response?.data?.message || 'Error clearing store data. Check your admin password.');
    } finally {
      setDeletingAll(false);
    }
  };

  const currentStats = stats || EMPTY_STATS;
  const popularThemes = Array.isArray(currentStats.popularThemes) ? currentStats.popularThemes : [];
  const recentOrders = Array.isArray(currentStats.recentOrders) ? currentStats.recentOrders : [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Dashboard Overview</h1>
            <p className="text-xs text-slate-400">DD MYSTERY BOX Commercial Operations & Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-pink-400 hover:text-pink-300 relative transition-all flex items-center justify-center"
                title="New Order Notifications"
              >
                <Bell className="w-4 h-4" />
                {!notificationsCleared && recentOrders.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  </>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm sm:hidden"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-96 max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-pink-400" />
                        <h3 className="text-xs font-black text-white font-display uppercase tracking-wider">
                          New Order Notifications
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notificationsCleared && recentOrders.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearNotifications}
                            className="text-xs font-bold text-pink-400 hover:text-pink-300 hover:underline transition-colors mr-1"
                          >
                            Clear All
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                      {notificationsCleared || recentOrders.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 font-semibold">
                          No new order notifications.
                        </div>
                      ) : (
                        recentOrders.slice(0, 5).map((ord) => (
                          <div
                            key={ord._id}
                            className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 space-y-1 hover:border-pink-500/40 transition-all text-left"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-amber-300">#{ord.orderId || ord.orderNumber}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-pink-500/20 text-pink-300">
                                {ord.orderStatus}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-300 text-[11px]">
                              <span>{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</span>
                              <span className="font-bold text-emerald-400">₹{ord.totalAmount}</span>
                            </div>
                            <div className="pt-1 flex justify-end gap-2 text-[10px]">
                              <Link
                                to="/admin/payments"
                                onClick={() => setShowNotifications(false)}
                                className="text-pink-400 font-bold hover:underline"
                              >
                                Verify Payment →
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Analytics Active
            </div>
          </div>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Revenue</span>
                <span className="text-2xl font-black text-white font-display">₹{(currentStats.totalRevenue || 0).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">↑ Lifetime Sales</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-pink-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Today's Revenue</span>
                <span className="text-2xl font-black text-pink-400 font-display">₹{(currentStats.todayRevenue || 0).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Today's collection</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Orders</span>
                <span className="text-2xl font-black text-white font-display">{currentStats.totalOrders || 0}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Today: {currentStats.todayOrders || 0} new orders</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Pending Orders</span>
                <span className="text-2xl font-black text-amber-300 font-display">{currentStats.pendingOrders || 0}</span>
                <span className="text-[10px] text-amber-400 block mt-1">Requires Workshop Packing</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Delivered Orders</span>
                <span className="text-2xl font-black text-emerald-300 font-display">{currentStats.deliveredOrders || 0}</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Successfully fulfilled</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-blue-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Customers</span>
                <span className="text-2xl font-black text-blue-300 font-display">{currentStats.totalCustomers || 0}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Registered accounts</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Avg Order Value</span>
                <span className="text-2xl font-black text-indigo-300 font-display">₹{currentStats.averageOrderValue || 0}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Per mystery box order</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-pink-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">System Health</span>
                <span className="text-sm font-black text-emerald-400 uppercase">100% Operational</span>
                <span className="text-[10px] text-slate-400 block mt-1">APIs & DB Connected</span>
              </div>
            </div>

            {/* Popular Themes Analytics Bar */}
            {popularThemes.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
                <h3 className="text-sm font-bold text-white font-display mb-4">Most Popular Mystery Themes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {popularThemes.map((theme, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-xs font-extrabold text-pink-400 uppercase block">{theme.name}</span>
                      <span className="text-lg font-black text-white font-display mt-1 block">{theme.count} Orders</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders List */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-display">Recent Mystery Box Orders</h3>
                <Link to="/admin/orders" className="text-xs font-bold text-pink-400 hover:underline">View All Orders →</Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          No customer orders placed yet. Real orders placed on the website will appear here instantly!
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-300">{ord.orderId || ord.orderNumber}</td>
                          <td className="p-3 font-bold text-white">{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</td>
                          <td className="p-3 font-bold text-pink-400">₹{ord.totalAmount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="p-3">{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <Link to="/admin/orders" className="text-purple-400 hover:text-pink-400 font-bold">Inspect</Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DANGER ZONE: ALL DATA DELETE BUTTON */}
            <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                      🚨 DANGER ZONE: RESET & DELETE ALL DATA
                    </h3>
                    <p className="text-xs text-rose-300">
                      Permanently delete all test orders, payment screenshots, customer histories, and notification logs from database.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0 hover:scale-105 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> DELETE ALL STORE DATA
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* DELETE ALL DATA CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/50 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white font-display">
                Confirm Complete Data Purge
              </h3>
              <p className="text-xs text-rose-300 leading-relaxed">
                This action will permanently delete <strong>ALL orders, payment records, screenshots, notification logs, carts, and customer test data</strong> from the DD Mystery Box database.
              </p>
              <p className="text-[11px] text-slate-400">
                To proceed, enter your <strong className="text-amber-300">Admin Password</strong> below:
              </p>
            </div>

            <input
              type="password"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-rose-500/40 text-rose-300 font-mono text-center font-bold tracking-widest text-sm focus:outline-none focus:border-rose-400"
            />

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllData}
                disabled={deletingAll || !deleteConfirmText.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-40"
              >
                {deletingAll ? 'Deleting Data...' : 'YES, DELETE ALL DATA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
