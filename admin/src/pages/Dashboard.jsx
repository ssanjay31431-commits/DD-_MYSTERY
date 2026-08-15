import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, DollarSign, CreditCard, Clock, CheckCircle2, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';

const EMPTY_ADMIN_STATS = {
  totalRevenue: 0,
  todayRevenue: 0,
  advanceCollected: 0,
  expectedCodCollection: 0,
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  recentOrders: []
};

export const Dashboard = () => {
  const [stats, setStats] = useState(EMPTY_ADMIN_STATS);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7Days');

  const computeStatsFromLocalOrders = () => {
    const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
    if (!Array.isArray(localOrders) || localOrders.length === 0) {
      return EMPTY_ADMIN_STATS;
    }

    const totalRev = localOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const advanceColl = localOrders.reduce((acc, o) => acc + (o.advancePaid || 0), 0);
    const codColl = localOrders.reduce((acc, o) => acc + (o.remainingCodAmount || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRev = localOrders
      .filter((o) => o.createdAt && o.createdAt.startsWith(todayStr))
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const pendingCount = localOrders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
    const deliveredCount = localOrders.filter((o) => o.orderStatus === 'Delivered').length;

    return {
      totalRevenue: totalRev,
      todayRevenue: todayRev,
      advanceCollected: advanceColl,
      expectedCodCollection: codColl,
      totalOrders: localOrders.length,
      pendingOrders: pendingCount,
      deliveredOrders: deliveredCount,
      recentOrders: localOrders
    };
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/dashboard?period=${dateFilter}`);
      if (data && typeof data === 'object' && data.totalRevenue !== undefined && !data.message) {
        setStats(data);
      } else {
        setStats(computeStatsFromLocalOrders());
      }
    } catch (err) {
      setStats(computeStatsFromLocalOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  const currentStats = stats || EMPTY_ADMIN_STATS;
  const recentOrders = Array.isArray(currentStats.recentOrders) ? currentStats.recentOrders : [];

  return (
    <div className="flex min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-3xl font-black text-white font-display">Business Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">Live order metrics, advance payments, expected COD collection, and customer activity.</p>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
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
              onClick={fetchStats}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
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
            <span className="text-[11px] text-slate-400 block">Verified via Online Gateway</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase text-slate-400">Expected COD Collection</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400 font-display block">
              ₹{(currentStats.expectedCodCollection || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Pending delivery collection</span>
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

        {/* Recent Orders Table */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h3 className="text-lg font-bold text-white font-display">Recent Customer Orders</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Value</th>
                  <th className="p-3">Advance Paid</th>
                  <th className="p-3">Remaining COD</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No customer orders placed yet. Real orders placed on the website will appear here instantly!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300">{ord.orderId}</td>
                      <td className="p-3 font-bold text-white">{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</td>
                      <td className="p-3 font-bold text-white">₹{ord.totalAmount}</td>
                      <td className="p-3 text-emerald-400 font-bold">₹{ord.advancePaid || 0}</td>
                      <td className="p-3 text-amber-300 font-bold">₹{ord.remainingCodAmount || 0}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};
