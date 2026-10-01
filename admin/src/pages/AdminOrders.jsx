import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Filter, RefreshCw, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
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
      console.error('Failed to fetch admin orders from MongoDB:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDeleteOrder = async (targetId, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderNumber}? This will remove the order document from the database.`)) {
      return;
    }

    try {
      const { data } = await API.delete(`/admin/orders/${targetId}`);
      if (data && data.success) {
        fetchOrders(true);
      } else {
        alert(data?.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('[Delete Order Error]', err);
      alert(err.response?.data?.message || 'Error deleting order');
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(() => {
      if (document.hidden) return;
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
    const cfOrderId = (ord.paymentInfo?.cashfreeOrderId || ord.paymentInfo?.paymentOrderId || '').toLowerCase();
    const prodName = (ord.items?.[0]?.productSnapshot?.name || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      ordNumber.includes(searchLower) ||
      custName.includes(searchLower) ||
      custEmail.includes(searchLower) ||
      custPhone.includes(searchLower) ||
      cfOrderId.includes(searchLower) ||
      prodName.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Cashfree Paid Orders Only
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white font-display">Confirmed Orders Directory</h1>
            <p className="text-xs text-slate-400">Showing only successfully verified paid customer orders.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchOrders(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Orders List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative flex-1 sm:flex-none min-w-[160px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Order #, Name, Email, Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="ORDER_CONFIRMED">Confirmed</option>
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
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-purple-500/20 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product Snapshot</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    {loading ? 'Fetching paid orders from database...' : 'No confirmed orders match criteria. New paid customer orders will appear here automatically!'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const ordNum = ord.orderNumber || ord.orderId;
                  const firstItem = ord.items?.[0] || {};
                  const prodName = firstItem.productSnapshot?.name || firstItem.name || 'DD Mystery Box';
                  const totalQty = ord.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;
                  const total = ord.pricing?.totalAmount || ord.totalAmount || 0;
                  const payStatus = ord.paymentInfo?.status || 'PAID';

                  return (
                    <tr key={ord._id || ordNum} className="hover:bg-purple-950/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300">#{ordNum}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{ord.deliveryAddressSnapshot?.fullName || ord.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{ord.deliveryAddressSnapshot?.email || ord.user?.email || 'N/A'}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">
                        {prodName} {ord.items?.length > 1 ? `(+${ord.items.length - 1} more)` : ''}
                      </td>
                      <td className="p-3 font-bold text-slate-300">{totalQty}</td>
                      <td className="p-3 font-black text-white font-display">₹{total}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> {payStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                          ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${ord._id}`}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-md shadow-pink-500/20"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Full Order
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord._id, ordNum)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 hover:text-white transition-all shrink-0"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
