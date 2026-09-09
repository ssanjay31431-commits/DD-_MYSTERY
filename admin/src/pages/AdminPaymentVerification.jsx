import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, RefreshCw, User, Phone, Mail, Package, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

export const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchPaymentsList = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/payments/admin/list');
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.error('[Fetch Payments List Error]', err);
      addToast('Failed to fetch Cashfree payments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

  const paymentList = Array.isArray(payments) ? payments : [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Cashfree Payments & Transactions
            </h1>
            <p className="text-xs text-slate-400">All customer payments are automatically processed and verified securely by Cashfree Payment Gateway.</p>
          </div>
          <button
            onClick={fetchPaymentsList}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Transactions
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Automated Payment Verification Active</span>
            <span className="text-slate-400 text-[11px]">
              Manual payment screenshot approval is disabled. Cashfree REST API automatically verifies transactions, marks orders as PAID, and triggers confirmation emails.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-bold">Loading Cashfree transactions...</div>
        ) : paymentList.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-purple-500/20 max-w-md mx-auto space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Transaction Records Yet</h3>
            <p className="text-xs text-slate-400">Transactions processed through Cashfree Payment Gateway will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentList.map((item) => {
              const customer = item.customer || item.order?.user || {};
              const orderId = item.orderId || item.order?.orderNumber || item.order?.orderId || item._id;
              const amount = item.amount || item.order?.totalAmount || 0;
              const status = item.status || 'PENDING';
              const isCompleted = status === 'PAYMENT_COMPLETED' || item.order?.orderStatus === 'ORDER_CONFIRMED';

              return (
                <div
                  key={item._id}
                  className="glass-panel p-4 sm:p-6 rounded-2xl border border-purple-500/20 bg-slate-950/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Cashfree Order Ref</span>
                      <h3 className="text-sm sm:text-base font-black text-pink-400 font-mono">#{orderId}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-display">₹{amount}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isCompleted ? 'PAID (Cashfree Verified)' : status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Customer Name:</span>
                      <span className="font-bold text-white">{customer.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email:</span>
                      <span className="font-bold text-white">{customer.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date & Time:</span>
                      <span className="font-mono text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
