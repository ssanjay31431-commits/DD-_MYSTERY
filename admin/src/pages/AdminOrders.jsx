import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Filter, CheckCircle2, Clock, Truck } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';

const DEFAULT_ADMIN_ORDERS = [
  {
    _id: 'ord_demo_101',
    orderId: 'DD-2026-9821',
    totalAmount: 499,
    advancePaid: 100,
    remainingCodAmount: 399,
    orderStatus: 'Packed',
    createdAt: new Date().toISOString(),
    user: { name: 'Rahul Sharma', email: 'rahul@example.com' },
    deliveryAddressSnapshot: { fullName: 'Rahul Sharma', email: 'rahul@example.com' },
    items: [{ quantity: 1 }]
  },
  {
    _id: 'ord_demo_102',
    orderId: 'DD-2026-9822',
    totalAmount: 199,
    advancePaid: 100,
    remainingCodAmount: 99,
    orderStatus: 'Dispatched',
    createdAt: new Date().toISOString(),
    user: { name: 'Priya Patel', email: 'priya@example.com' },
    deliveryAddressSnapshot: { fullName: 'Priya Patel', email: 'priya@example.com' },
    items: [{ quantity: 1 }]
  }
];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const getOrdersFromLocal = () => {
    const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
    if (Array.isArray(localOrders) && localOrders.length > 0) {
      return localOrders;
    }
    return DEFAULT_ADMIN_ORDERS;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders/admin/all');
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(getOrdersFromLocal());
      }
    } catch (err) {
      console.warn('Admin orders endpoint notice, using local store:', err.message);
      setOrders(getOrdersFromLocal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : getOrdersFromLocal();

  const filteredOrders = safeOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'All' || ord.orderStatus === statusFilter;
    const matchesSearch =
      ord.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.deliveryAddressSnapshot?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Customer Order Management</h1>
            <p className="text-xs text-slate-400">Track 8-stage order progress, view advance payments, remaining COD, and dispatch email updates.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Order ID, Name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Payment Confirmed">Payment Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Advance Paid</th>
                <th className="p-3">Remaining COD</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{ord.orderId}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{ord.user?.email || ord.deliveryAddressSnapshot?.email}</span>
                    </td>
                    <td className="p-3">{ord.items?.length || 1} Box(es)</td>
                    <td className="p-3 font-bold text-white">₹{ord.totalAmount}</td>
                    <td className="p-3 font-bold text-emerald-400">₹{ord.advancePaid || ord.advanceRequired || 0}</td>
                    <td className="p-3 font-bold text-amber-300">₹{ord.remainingCodAmount || 0}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 hover:text-white text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect & Track
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};
