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
  Eye,
  Trash2,
  X,
  AlertCircle,
  Clock,
  Search
} from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

export const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // 'PENDING', 'ALL', 'VERIFIED'
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRejectItem, setTargetRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('Payment screenshot details could not be verified.');

  const { addToast } = useToast();

  const fetchPaymentsList = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/payments/admin/pending');
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.error('[Fetch Pending Payments Error]', err);
      addToast('Failed to fetch payment verification list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

  const handleVerifyPayment = async (item) => {
    const targetId = item._id;
    const displayOrderId = item.orderId || item.order?.orderNumber || item.order?.orderId;
    setVerifyingId(targetId);

    try {
      const { data } = await API.put(`/payments/admin/verify/${targetId}`);
      if (data && data.success) {
        addToast(`🎉 Order #${displayOrderId} payment verified & confirmed successfully!`);
        fetchPaymentsList();
      } else {
        throw new Error(data?.message || 'Verification failed');
      }
    } catch (err) {
      console.error('[Verify Payment Error]', err);
      addToast(err.response?.data?.message || err.message || 'Payment approval failed', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const openRejectModal = (item) => {
    setTargetRejectItem(item);
    setRejectReason('Payment screenshot details could not be verified.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetRejectItem) return;
    const targetId = targetRejectItem._id;
    const displayOrderId = targetRejectItem.orderId || targetRejectItem.order?.orderNumber;
    setRejectingId(targetId);

    try {
      const { data } = await API.put(`/payments/admin/reject/${targetId}`, {
        reason: rejectReason
      });
      if (data && data.success) {
        addToast(`Payment rejected & Order #${displayOrderId} cancelled.`);
        setRejectModalOpen(false);
        setTargetRejectItem(null);
        fetchPaymentsList();
      } else {
        throw new Error(data?.message || 'Rejection failed');
      }
    } catch (err) {
      console.error('[Reject Payment Error]', err);
      addToast(err.response?.data?.message || err.message || 'Payment rejection failed', 'error');
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeleteOrder = async (orderId, displayId) => {
    if (!window.confirm(`Are you sure you want to delete order #${displayId}?`)) return;
    try {
      await API.delete(`/orders/${orderId}`);
      addToast(`Order #${displayId} deleted successfully.`);
      fetchPaymentsList();
    } catch (err) {
      addToast('Failed to delete order', 'error');
    }
  };

  const paymentList = Array.isArray(payments) ? payments : [];

  const filteredPayments = paymentList.filter((item) => {
    const orderObj = item.order || {};
    const customerObj = item.customer || orderObj.user || {};
    const status = item.status || orderObj.orderStatus || '';
    const displayOrderId = item.orderId || orderObj.orderNumber || orderObj.orderId || '';

    const isVerified = status === 'PAYMENT_COMPLETED' || orderObj.orderStatus === 'ORDER_CONFIRMED' || orderObj.orderStatus === 'CONFIRMED';
    const isPending = !isVerified && status !== 'REJECTED' && status !== 'CANCELLED';

    // Tab Filter
    if (filter === 'PENDING' && !isPending) return false;
    if (filter === 'VERIFIED' && !isVerified) return false;

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nameMatch = (customerObj.name || '').toLowerCase().includes(term);
      const emailMatch = (customerObj.email || '').toLowerCase().includes(term);
      const phoneMatch = (customerObj.phone || orderObj.deliveryAddressSnapshot?.mobileNumber || '').includes(term);
      const orderMatch = displayOrderId.toLowerCase().includes(term);
      return nameMatch || emailMatch || phoneMatch || orderMatch;
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Payment Verification Dashboard
            </h1>
            <p className="text-xs text-slate-400">Review customer UPI payment screenshots, verify transactions, and approve or reject orders.</p>
          </div>
          <button
            onClick={fetchPaymentsList}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Submissions
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'PENDING'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Approval ({paymentList.filter(p => p.status !== 'PAYMENT_COMPLETED' && p.order?.orderStatus !== 'ORDER_CONFIRMED' && p.status !== 'REJECTED' && p.status !== 'CANCELLED').length})
            </button>
            <button
              onClick={() => setFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'VERIFIED'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Records ({paymentList.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by order, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" /> Loading payment verification records...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-purple-500/20 max-w-md mx-auto space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Pending Payments</h3>
            <p className="text-xs text-slate-400">All payment submissions have been reviewed or no orders match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((item) => {
              const orderObj = item.order || {};
              const customerObj = item.customer || orderObj.user || {};
              const addr = orderObj.deliveryAddressSnapshot || {};
              const displayOrderId = item.orderId || orderObj.orderNumber || orderObj.orderId || item._id;
              const totalAmount = item.amount || orderObj.totalAmount || 0;
              const screenshot = item.screenshotUrl || orderObj.paymentInfo?.screenshotUrl;
              const status = item.status || orderObj.orderStatus || 'PENDING';

              const isVerified = status === 'PAYMENT_COMPLETED' || orderObj.orderStatus === 'ORDER_CONFIRMED' || orderObj.orderStatus === 'CONFIRMED';
              const isRejected = status === 'REJECTED' || orderObj.orderStatus === 'CANCELLED';
              const itemsList = orderObj.items || [];
              const submittedAt = item.submittedAt || item.createdAt || orderObj.createdAt;

              return (
                <div
                  key={item._id}
                  className="glass-panel p-4 sm:p-6 rounded-3xl border border-purple-500/20 bg-slate-950/90 space-y-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

                    {/* Order & Customer Info */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Order Ref</span>
                          <h3 className="text-sm sm:text-base font-black text-pink-400 font-mono">#{displayOrderId}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isVerified ? 'VERIFIED' : isRejected ? 'REJECTED' : 'AWAITING APPROVAL'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(orderObj._id || item.orderId || item._id, displayOrderId)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 hover:text-white transition-all shrink-0"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <strong className="text-white text-sm truncate">{customerObj.name || addr.fullName || 'Customer'}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 truncate">
                          <Mail className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span className="truncate">{customerObj.email || addr.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{customerObj.phone || addr.mobileNumber || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Products ({itemsList.length || 1}):</span>
                          <span className="text-white font-semibold truncate max-w-[180px]">
                            {itemsList.map(i => i.productSnapshot?.name || i.name).join(', ') || 'DD Mystery Box'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total Payment Required:</span>
                          <span className="text-emerald-400 font-bold text-sm">₹{totalAmount}</span>
                        </div>
                        {submittedAt && (
                          <div className="flex justify-between text-slate-500 text-[10px]">
                            <span>Submitted At:</span>
                            <span>{new Date(submittedAt).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Screenshot Preview */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 w-full">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-pink-400" /> Payment Screenshot
                      </span>
                      {screenshot ? (
                        <div className="relative group cursor-pointer w-full flex justify-center" onClick={() => setSelectedScreenshot(screenshot)}>
                          <img
                            src={screenshot}
                            alt="Payment Screenshot"
                            className="max-h-48 sm:max-h-40 rounded-xl object-contain border border-purple-500/40 group-hover:opacity-80 transition-all"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-slate-950/70 rounded-xl">
                            <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-lg">
                              <Eye className="w-3.5 h-3.5" /> Zoom Screenshot
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No screenshot uploaded yet by customer.
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-3 flex flex-col justify-center items-stretch h-full space-y-3 w-full">
                      {isVerified ? (
                        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-1 text-xs">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                          <span className="font-bold text-emerald-300 block">Verified & Approved</span>
                          <span className="text-[10px] text-slate-400 block">Order Status: CONFIRMED</span>
                        </div>
                      ) : isRejected ? (
                        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-center space-y-1 text-xs">
                          <XCircle className="w-6 h-6 text-rose-400 mx-auto" />
                          <span className="font-bold text-rose-300 block">Payment Rejected</span>
                          <span className="text-[10px] text-slate-400 block">Order Status: CANCELLED</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 w-full">
                          <button
                            onClick={() => handleVerifyPayment(item)}
                            disabled={verifyingId === item._id || rejectingId === item._id}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {verifyingId === item._id ? 'Approving Payment...' : 'Payment Completed'}
                          </button>

                          <button
                            onClick={() => openRejectModal(item)}
                            disabled={verifyingId === item._id || rejectingId === item._id}
                            className="w-full py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            {rejectingId === item._id ? 'Rejecting Payment...' : 'Reject Payment'}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for full screenshot view */}
        {selectedScreenshot && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-3xl w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-4 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-pink-400" /> Full Payment Screenshot Preview
                </h3>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                <img src={selectedScreenshot} alt="Full Screenshot" className="max-h-[70vh] rounded-2xl object-contain border border-purple-500/30" />
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Reject Payment Submission
                </h3>
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Specify a reason for rejecting this payment submission. A cancellation notification email will be dispatched to the customer.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={rejectingId !== null}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1"
                >
                  {rejectingId !== null ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
