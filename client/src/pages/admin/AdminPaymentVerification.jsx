import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Eye, AlertCircle, RefreshCw, X, User, Phone, Mail, Package } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useToast } from '../../context/ToastContext';

export const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const { addToast } = useToast();

  const fetchPendingPayments = async () => {
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
    fetchPendingPayments();
  }, []);

  const handleVerifyPayment = async (paymentItem) => {
    const targetId = paymentItem._id;
    const orderId = paymentItem.orderId || paymentItem.order?.orderNumber || paymentItem.order?.orderId;
    
    setVerifyingId(targetId);

    try {
      const { data } = await API.put(`/payments/admin/verify/${targetId}`);
      if (data && data.success) {
        addToast(`✅ Payment verified! Order ${orderId} is now confirmed.`);
        fetchPendingPayments();
      } else {
        addToast(data?.message || 'Payment verification failed', 'error');
      }
    } catch (err) {
      console.error('[Verify Payment Error]', err);
      addToast(err.response?.data?.message || 'Failed to verify payment', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const paymentList = Array.isArray(payments) ? payments : [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">Payment Verification</h1>
            <p className="text-xs text-slate-400">Review customer uploaded payment screenshots and manually approve genuine UPI payments.</p>
          </div>
          <button
            onClick={fetchPendingPayments}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh List
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-bold">Loading payment requests...</div>
        ) : paymentList.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-purple-500/20 max-w-md mx-auto space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Pending Payments</h3>
            <p className="text-xs text-slate-400">All customer payments have been verified or there are no new orders waiting for payment screenshot verification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {paymentList.map((item) => {
              const orderObj = item.order || {};
              const customerObj = item.customer || orderObj.user || {};
              const addr = orderObj.deliveryAddressSnapshot || {};
              const displayOrderId = item.orderId || orderObj.orderNumber || orderObj.orderId || 'DM1001';
              const itemsList = orderObj.items || [];
              const totalAmount = item.amount || orderObj.totalAmount || 499;
              const status = item.status || orderObj.orderStatus || 'PENDING_PAYMENT';
              const isVerified = status === 'PAYMENT_COMPLETED' || status === 'ORDER_CONFIRMED' || status === 'CONFIRMED';
              const screenshot = item.screenshotUrl;
              const submittedAt = item.submittedAt || item.createdAt;

              return (
                <div
                  key={item._id}
                  className={`glass-panel p-4 sm:p-6 rounded-3xl border transition-all ${
                    isVerified
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-purple-500/30 bg-slate-900/60'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Customer & Order Information */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-pink-400 bg-slate-950 px-3 py-1 rounded-xl border border-purple-500/30">
                          #{displayOrderId}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase border ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isVerified ? '✅ PAYMENT COMPLETED' : '⏳ PENDING VERIFICATION'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <strong className="text-white text-sm truncate">{customerObj.name || addr.fullName || 'Customer'}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 truncate">
                          <Mail className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span className="truncate">{customerObj.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{customerObj.phone || addr.mobileNumber || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
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
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 w-full">
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
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-slate-950/60 rounded-xl">
                            <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1">
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

                    {/* Action Button */}
                    <div className="lg:col-span-3 flex flex-col justify-center items-stretch h-full space-y-3 w-full">
                      {isVerified ? (
                        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-1 text-xs">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                          <span className="font-bold text-emerald-300 block">Verified & Approved</span>
                          <span className="text-[10px] text-slate-400 block">Order Status: CONFIRMED</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerifyPayment(item)}
                          disabled={verifyingId === item._id}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {verifyingId === item._id ? 'Approving Payment...' : 'Payment Completed'}
                        </button>
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

      </main>
    </div>
  );
};
