import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Filter, RefreshCw } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await API.get('/admin/orders');
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      try {
        const { data } = await API.get('/orders/admin/all');
        if (Array.isArray(data)) setOrders(data);
      } catch (e) {
        console.error('Failed to fetch admin orders from MongoDB:', e);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    // Automatic polling every 12 seconds to auto-refresh admin orders from MongoDB
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrders.filter((ord) => {
    const ordStatus = (ord.orderStatus || '').toUpperCase();
    const filterUpper = statusFilter.toUpperCase();
    const matchesStatus = statusFilter === 'All' || ordStatus === filterUpper || ord.orderStatus === statusFilter;

    const ordNumber = (ord.orderNumber || ord.orderId || '').toLowerCase();
    const custName = (ord.user?.name || ord.deliveryAddressSnapshot?.fullName || '').toLowerCase();
    const custEmail = (ord.user?.email || ord.deliveryAddressSnapshot?.email || '').toLowerCase();
    const custPhone = (ord.user?.phone || ord.deliveryAddressSnapshot?.mobileNumber || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      ordNumber.includes(searchLower) ||
      custName.includes(searchLower) ||
      custEmail.includes(searchLower) ||
      custPhone.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">Customer Order Management</h1>
            <p className="text-xs text-slate-400">Live order database synced with MongoDB. Automatic real-time refresh active.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchOrders(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Orders List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative flex-1 sm:flex-none min-w-[140px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="ORDER PLACED">Order Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT FOR DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Advance Paid</th>
                <th className="p-3">Remaining Balance</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {loading ? 'Fetching orders from MongoDB database...' : 'No customer orders match the criteria. New customer orders will appear here automatically!'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const ordNum = ord.orderNumber || ord.orderId;
                  const total = ord.pricing?.totalAmount || ord.totalAmount || 0;
                  const paid = ord.pricing?.amountPaid !== undefined ? ord.pricing.amountPaid : (ord.amountPaid || ord.advancePaid || 0);
                  const rem = ord.pricing?.remainingBalance !== undefined ? ord.pricing.remainingBalance : (ord.remainingBalance !== undefined ? ord.remainingBalance : (ord.remainingCodAmount || 0));
                  const method = ord.paymentInfo?.method === 'FULL' || ord.paymentMethod === 'FULL' || ord.paymentMethod === 'full_online' ? 'Full Online' : 'Advance Payment';

                  return (
                    <tr key={ord._id || ordNum} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300">#{ordNum}</td>
                      <td className="p-3 text-[12px] text-slate-300 font-mono">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{ord.user?.email || ord.deliveryAddressSnapshot?.email || 'N/A'}</span>
                      </td>
                      <td className="p-3 font-bold text-white">₹{total}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{paid}</td>
                      <td className="p-3 font-bold text-amber-300">₹{rem}</td>
                      <td className="p-3 font-semibold text-slate-300">{method}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'Cancelled'
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
                          <Eye className="w-3.5 h-3.5" /> Inspect Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};
