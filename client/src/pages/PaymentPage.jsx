import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { loadCashfreeSDK } from '../utils/cashfree';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const orderIdParam = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [orderData, setOrderData] = useState(null);
  const [retryingPayment, setRetryingPayment] = useState(false);

  useEffect(() => {
    if (!orderIdParam) {
      setLoading(false);
      return;
    }

    checkPaymentStatus();
  }, [orderIdParam]);

  const checkPaymentStatus = async () => {
    if (!orderIdParam) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/payments/status/${orderIdParam}`);
      if (data && data.success) {
        setPaymentStatus(data.paymentStatus || 'SUCCESS');
        setOrderData(data.order);
        if (data.paymentStatus === 'SUCCESS' || data.orderStatus === 'ORDER_CONFIRMED') {
          addToast('🎉 Payment verified successfully!');
        }
      } else {
        setPaymentStatus(data?.paymentStatus || 'FAILED');
      }
    } catch (err) {
      console.error('[Payment Status Check Error]', err);
      setPaymentStatus('FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryCashfreePayment = async () => {
    if (!orderData) {
      navigate('/checkout');
      return;
    }

    setRetryingPayment(true);
    try {
      const { data } = await API.post('/payments/create-order', {
        items: orderData.items,
        deliveryAddress: orderData.deliveryAddressSnapshot,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        couponDiscount: orderData.couponDiscount,
        totalAmount: orderData.totalAmount
      });

      if (data && data.payment_session_id) {
        const cashfree = await loadCashfreeSDK();
        const result = await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_modal'
        });

        if (result?.error) {
          addToast(result.error.message || 'Payment failed', 'error');
        } else {
          checkPaymentStatus();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to restart payment checkout', 'error');
    } finally {
      setRetryingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="font-bold text-sm">Verifying payment status with Cashfree...</span>
        </div>
      </div>
    );
  }

  const isVerified = paymentStatus === 'SUCCESS' || orderData?.orderStatus === 'ORDER_CONFIRMED';
  const displayAmount = orderData?.totalAmount || orderData?.pricing?.totalAmount || 499;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 space-y-8 text-center">
        
        {/* Header section based on Cashfree Payment Status */}
        {isVerified ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5 mx-auto">
              <ShieldCheck className="w-4 h-4" /> Secure Payment Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Payment Successful!
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your payment of <strong className="text-emerald-400 font-bold">₹{displayAmount}</strong> has been processed & verified via Cashfree Payment Gateway.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-2 text-left text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-pink-400">{orderIdParam || orderData?.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gateway:</span>
                <span className="font-bold text-white">Cashfree Payment Gateway</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Payment Status:</span>
                <span>PAID</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate(`/order-success/${orderIdParam || orderData?.orderNumber || ''}`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2"
              >
                View Order Bill & Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mx-auto shadow-xl shadow-amber-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                Cashfree Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                Payment Pending or Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                Your payment session was not completed or is awaiting confirmation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-slate-300 max-w-md mx-auto space-y-2">
              <p className="flex items-center justify-center gap-2 font-semibold text-pink-400">
                <CreditCard className="w-4 h-4" /> Cashfree Secure Gateway
              </p>
              <p className="text-slate-400 text-[11px]">
                You can re-check payment status or click below to retry payment using Cashfree.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={checkPaymentStatus}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Re-check Status
              </button>
              <button
                onClick={handleRetryCashfreePayment}
                disabled={retryingPayment}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {retryingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retry Payment with Cashfree →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
