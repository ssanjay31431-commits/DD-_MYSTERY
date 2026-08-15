import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Clock, CheckCircle2, TrendingUp, Award, Eye, Shield } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Dashboard Overview</h1>
            <p className="text-xs text-slate-400">DD MYSTERY BOX Commercial Operations & Analytics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Analytics Active
          </div>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : (
          <>
            {/* Top 8 Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Revenue</span>
                <span className="text-2xl font-black text-white font-display">₹{stats.totalRevenue?.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">↑ Lifetime Sales</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-pink-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Today's Revenue</span>
                <span className="text-2xl font-black text-pink-400 font-display">₹{stats.todayRevenue?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Today's collection</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Orders</span>
                <span className="text-2xl font-black text-white font-display">{stats.totalOrders}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Today: {stats.todayOrders} new orders</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Pending Orders</span>
                <span className="text-2xl font-black text-amber-300 font-display">{stats.pendingOrders}</span>
                <span className="text-[10px] text-amber-400 block mt-1">Requires Workshop Packing</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Delivered Orders</span>
                <span className="text-2xl font-black text-emerald-300 font-display">{stats.deliveredOrders}</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Successfully fulfilled</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-blue-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Total Customers</span>
                <span className="text-2xl font-black text-blue-300 font-display">{stats.totalCustomers}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Registered accounts</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">Avg Order Value</span>
                <span className="text-2xl font-black text-indigo-300 font-display">₹{stats.averageOrderValue}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Per birthday box order</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-pink-500/20">
                <span className="text-xs text-slate-400 font-bold block mb-1">System Health</span>
                <span className="text-sm font-black text-emerald-400 uppercase">100% Operational</span>
                <span className="text-[10px] text-slate-400 block mt-1">APIs & DB Connected</span>
              </div>
            </div>

            {/* Popular Themes Analytics Bar */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
              <h3 className="text-sm font-bold text-white font-display mb-4">Most Popular Birthday Themes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {stats.popularThemes?.map((theme, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-xs font-extrabold text-pink-400 uppercase block">{theme.name}</span>
                    <span className="text-lg font-black text-white font-display mt-1 block">{theme.count} Orders</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-display">Recent Birthday Box Orders</h3>
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
                    {stats.recentOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-300">{ord.orderId}</td>
                        <td className="p-3 font-bold text-white">{ord.user?.name || 'Customer'}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
