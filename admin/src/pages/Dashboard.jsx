import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, DollarSign, CreditCard, Clock, CheckCircle2, AlertTriangle, Calendar, RefreshCw, ShieldAlert, Trash2, Bell, X } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';

const EMPTY_ADMIN_STATS = {
  totalRevenue: 0,
  todayRevenue: 0,
  advanceCollected: 0,
  remainingBalanceCollection: 0,
  expectedCodCollection: 0,
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  recentOrders: [],
  failedPayments: []
};

export const Dashboard = () => {
  const [stats, setStats] = useState(EMPTY_ADMIN_STATS);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7Days');
  const [recoveringId, setRecoveringId] = useState(null);
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

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await API.get(`/admin/dashboard?period=${dateFilter}`);
      if (data && typeof data === 'object') {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats from MongoDB:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    // Automatic polling every 12 seconds for real-time order dashboard refresh
    const interval = setInterval(() => {
      fetchStats(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [dateFilter]);

  const handleRecoverPayment = async (failedId) => {
    setRecoveringId(failedId);
    try {
      const { data } = await API.post(`/admin/recover-payment/${failedId}`);
      if (data.success) {
        alert(`Order ${data.order?.orderNumber || ''} created successfully from payment reference!`);
        fetchStats(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to recover payment order');
    } finally {
      setRecoveringId(null);
    }
  };

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
        fetchStats(true);
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

  const currentStats = stats || EMPTY_ADMIN_STATS;
  const recentOrders = Array.isArray(currentStats.recentOrders) ? currentStats.recentOrders : [];
  const failedPayments = Array.isArray(currentStats.failedPayments) ? currentStats.failedPayments : [];

  const remainingBalanceTotal = currentStats.remainingBalanceCollection !== undefined
    ? currentStats.remainingBalanceCollection
    : (currentStats.expectedCodCollection || 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto min-w-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white font-display">Business Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">Live order metrics & analytics direct from MongoDB. Auto-refresh active.</p>
          </div>

          <div className="flex items-center gap-2">
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

            <Calendar className="w-4 h-4 text-amber-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="7Days">Last 7 Days</option>
              <option value="30Days">Last 30 Days</option>
              <option value="All">All Time</option>
            </select>
            <button
              onClick={() => fetchStats(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Failed Payment Recovery Alert Banner (Requirement 18) */}
        {failedPayments.length > 0 && (
          <div className="p-6 rounded-3xl bg-rose-950/80 border border-rose-500/50 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
              <div>
                <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                  ⚠️ PAYMENT RECEIVED — ORDER CREATION FAILED ({failedPayments.length})
                </h3>
                <p className="text-xs text-rose-200">
                  Cashfree payment was received, but MongoDB order creation failed. Click recover to generate the order document safely.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {failedPayments.map((fp) => (
                <div key={fp._id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-white block">Payment ID: {fp.paymentOrderId}</span>
                    <span className="text-slate-400 block">Customer: {fp.userSnapshot?.name} ({fp.userSnapshot?.email})</span>
                    <span className="text-amber-300 font-bold block">Paid: ₹{fp.pricing?.amountPaid || fp.pricing?.advanceAmount} | Total: ₹{fp.pricing?.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => handleRecoverPayment(fp._id)}
                    disabled={recoveringId === fp._id}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 text-white font-black text-xs uppercase shadow-lg disabled:opacity-50"
                  >
                    {recoveringId === fp._id ? 'Creating Order...' : '[ CREATE ORDER FROM PAYMENT ]'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase text-slate-400">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-white font-display block">
              ₹{(currentStats.totalRevenue || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold block">
              Today: ₹{(currentStats.todayRevenue || 0).toLocaleString()}
            </span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase text-slate-400">Advance Paid Online</span>
              <CreditCard className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-3xl font-black text-pink-400 font-display block">
              ₹{(currentStats.advanceCollected || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Verified via Cashfree Gateway</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase text-slate-400">Remaining Balance</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400 font-display block">
              ₹{(remainingBalanceTotal || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Total uncollected remaining balance</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase text-slate-400">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-3xl font-black text-white font-display block">
              {currentStats.totalOrders || 0}
            </span>
            <span className="text-[11px] text-purple-400 font-bold block">
              Pending: {currentStats.pendingOrders || 0} | Delivered: {currentStats.deliveredOrders || 0}
            </span>
          </div>

        </div>

        {/* Recent Orders Table (Requirement 19) */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white font-display">🔔 NEW & RECENT CUSTOMER ORDERS</h3>
            <span className="text-xs font-mono text-purple-400">Synced with MongoDB</span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Total Value</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Remaining Balance</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      No customer orders placed yet. Real orders placed on the website will appear here instantly!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => {
                    const ordNum = ord.orderNumber || ord.orderId;
                    const productName = ord.items?.[0]?.productSnapshot?.name || ord.items?.[0]?.name || 'DD 90s Kids Mystery Box';
                    const total = ord.pricing?.totalAmount || ord.totalAmount || 0;
                    const paid = ord.pricing?.amountPaid !== undefined ? ord.pricing.amountPaid : (ord.amountPaid || ord.advancePaid || 0);
                    const rem = ord.pricing?.remainingBalance !== undefined ? ord.pricing.remainingBalance : (ord.remainingBalance !== undefined ? ord.remainingBalance : (ord.remainingCodAmount || 0));
                    const method = ord.paymentInfo?.method === 'FULL' || ord.paymentMethod === 'FULL' || ord.paymentMethod === 'full_online' ? 'Full Online' : 'Advance Payment';

                    return (
                      <tr key={ord._id || ordNum} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-300">#{ordNum}</td>
                        <td className="p-3 font-bold text-white">{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</td>
                        <td className="p-3 text-slate-200">{productName}</td>
                        <td className="p-3 font-bold text-white">₹{total}</td>
                        <td className="p-3 text-emerald-400 font-bold">₹{paid}</td>
                        <td className="p-3 text-amber-300 font-bold">₹{rem}</td>
                        <td className="p-3 text-purple-300 font-semibold">{method}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
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
