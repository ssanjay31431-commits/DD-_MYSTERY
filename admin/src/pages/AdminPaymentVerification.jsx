import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  User,
  Phone,
  Mail,
  Clock,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

export const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PAID', 'PENDING'
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingId, setSyncingId] = useState(null);

  const { addToast } = useToast();

  const fetchPaymentsList = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/payments/admin/list');
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.error('[Fetch Admin Payments Error]', err);
      addToast('Failed to fetch Cashfree payments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupExpired = async () => {
    if (!window.confirm('Purge all unpaid pending payment attempts older than 24 hours (1 day)? Paid orders will NOT be affected.')) {
      return;
    }
    try {
      const { data } = await API.delete('/payments/admin/cleanup-expired');
      addToast(data?.message || 'Expired pending payments cleaned up!');
      fetchPaymentsList();
    } catch (err) {
      console.error('[Cleanup Expired Error]', err);
      addToast(err.response?.data?.message || 'Failed to cleanup expired payments', 'error');
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

  const handleSyncPaymentStatus = async (item) => {
    const targetOrderId = item.orderId || item.cashfreeOrderId || item.order?.orderNumber || item.order?.orderId;
    if (!targetOrderId) return;
    setSyncingId(item._id);

    try {
      const { data } = await API.get(`/payments/status/${targetOrderId}`);
      if (data && data.success) {
        addToast(`Payment status synced for #${targetOrderId}: ${data.paymentStatus}`);
        fetchPaymentsList();
      }
    } catch (err) {
      console.error('[Sync Payment Status Error]', err);
      addToast('Failed to sync Cashfree status', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const filteredPayments = payments.filter((item) => {
    const orderObj = item.order || {};
    const userObj = item.customer || orderObj.user || {};
    const ordNumber = String(item.orderId || orderObj.orderNumber || orderObj.orderId || '').toLowerCase();
    const custName = String(userObj.name || '').toLowerCase();
    const custEmail = String(userObj.email || '').toLowerCase();
    const txId = String(item.transactionId || orderObj.paymentInfo?.transactionId || '').toLowerCase();

    const matchesSearch =
      ordNumber.includes(searchTerm.toLowerCase()) ||
      custName.includes(searchTerm.toLowerCase()) ||
      custEmail.includes(searchTerm.toLowerCase()) ||
      txId.includes(searchTerm.toLowerCase());

    const status = String(item.status || orderObj.paymentInfo?.status || orderObj.orderStatus || '').toUpperCase();
    const isPaid = status === 'PAID' || status === 'ORDER_CONFIRMED' || status === 'SUCCESS';

    if (filter === 'PAID') return matchesSearch && isPaid;
    if (filter === 'PENDING') return matchesSearch && !isPaid;

    return matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cashfree Automated Gateway Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Cashfree Payments Audit Log
            </h1>
            <p className="text-xs text-slate-400">
              Real-time Cashfree online transactions, payment verification statuses, and order references.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCleanupExpired}
              title="Purge unpaid pending checkout attempts older than 24 hours"
              className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-red-500/10 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Purge Expired (&gt;24h)
            </button>
            <button
              onClick={fetchPaymentsList}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Log
            </button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-purple-500/20">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email or Tx Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'PAID', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table / List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
            <p className="font-bold text-xs">Loading Cashfree payment records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Cashfree Transactions Found</h3>
            <p className="text-xs text-slate-400">
              No online payment records match the selected filter.
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-purple-500/20 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Transaction Ref</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.map((item) => {
                    const orderObj = item.order || {};
                    const userObj = item.customer || orderObj.user || {};
                    const ordNumber = item.orderId || orderObj.orderNumber || orderObj.orderId || 'N/A';
                    const amount = item.amount || orderObj.totalAmount || 0;
                    const status = String(item.status || orderObj.paymentInfo?.status || orderObj.orderStatus || 'PENDING').toUpperCase();
                    const isPaid = status === 'PAID' || status === 'ORDER_CONFIRMED' || status === 'SUCCESS';
                    const txId = item.transactionId || orderObj.paymentInfo?.transactionId || 'Pending';

                    return (
                      <tr key={item._id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          #{ordNumber}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-white block">{userObj.name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400 block">{userObj.email || userObj.phone || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-pink-400 text-sm">
                          ₹{amount}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-300">
                          Cashfree Gateway
                        </td>
                        <td className="py-4 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[10px]">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                          {txId}
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-[11px]">
                          {new Date(item.createdAt || orderObj.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleSyncPaymentStatus(item)}
                            disabled={syncingId === item._id}
                            className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[11px] border border-purple-500/40 transition-colors inline-flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${syncingId === item._id ? 'animate-spin' : ''}`} />
                            Sync Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
