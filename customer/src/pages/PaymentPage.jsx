import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Lock
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { loadCashfreeSDK } from '../utils/cashfree';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const orderIdParam = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [payingWithCashfree, setPayingWithCashfree] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPaymentDetails = async (showLoader = false) => {
    if (!orderIdParam) {
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    else setVerifying(true);

    try {
      const { data } = await API.get(`/payments/status/${orderIdParam}`);
      if (data && data.success) {
        setOrderData(data.order);
        setPaymentData(data.payment);

        if (data.paymentStatus === 'PAID' || data.orderStatus === 'ORDER_CONFIRMED') {
          addToast('🎉 Payment Confirmed! Your order is placed.');
          setTimeout(() => {
            navigate(`/order-success/${orderIdParam}`, { replace: true });
          }, 1500);
        }
      } else {
        setErrorMsg(data?.message || 'Unable to fetch order payment status');
      }
    } catch (err) {
      console.error('[Fetch Payment Details Error]', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error fetching payment status');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails(true);
  }, [orderIdParam]);

  const handlePayNowWithCashfree = async () => {
    const rawSessionId = paymentData?.paymentSessionId || orderData?.paymentInfo?.paymentSessionId;
    const targetOrderId = orderIdParam || paymentData?.orderId || orderData?.orderNumber || orderData?.orderId;

    if (!rawSessionId || typeof rawSessionId !== 'string' || !rawSessionId.trim() || rawSessionId.startsWith('session_mock_')) {
      console.error('[Cashfree Validation Error] Invalid session ID on payment page:', rawSessionId);
      addToast('Unable to start payment. Please try again.', 'error');
      navigate('/checkout');
      return;
    }

    const targetSessionId = rawSessionId.trim();

    console.log('[Cashfree] Payment session received:', true);

    setPayingWithCashfree(true);
    try {
      const cashfree = await loadCashfreeSDK();
      addToast('Opening Cashfree Payment Gateway...', 'info');

      const checkoutOptions = {
        paymentSessionId: targetSessionId,
        redirectTarget: '_modal'
      };

      const result = await cashfree.checkout(checkoutOptions);

      if (result && result.error) {
        console.error('[Cashfree Checkout Error]', result.error);
        addToast(result.error.message || 'Payment cancelled or failed', 'error');
      } else {
        addToast('Verifying payment status...', 'info');
        await fetchPaymentDetails(false);
      }
    } catch (err) {
      console.error('[Cashfree SDK Error]', err);
      addToast('Could not launch Cashfree gateway. Please refresh and try again.', 'error');
    } finally {
      setPayingWithCashfree(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 glass-panel p-8 rounded-2xl border border-purple-500/30">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="font-bold text-sm">Verifying Cashfree payment details...</span>
        </div>
      </div>
    );
  }

  const orderIdDisplay = orderIdParam || paymentData?.orderId || paymentData?.cashfreeOrderId || orderData?.orderNumber || orderData?.orderId || 'N/A';
  const currentStatus = (paymentData?.status || orderData?.paymentInfo?.status || orderData?.orderStatus || 'PENDING').toUpperCase();
  const isPaid = currentStatus === 'PAID' || currentStatus === 'ORDER_CONFIRMED' || currentStatus === 'SUCCESS';
  const isFailed = currentStatus === 'FAILED' || currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED';
  
  const totalAmount = paymentData?.amount || paymentData?.pricing?.totalAmount || orderData?.totalAmount || orderData?.pricing?.totalAmount || 0;
  const displayItems = (paymentData?.items && paymentData.items.length > 0) ? paymentData.items : (orderData?.items || []);
  const transactionId = paymentData?.transactionId || orderData?.paymentInfo?.transactionId || '';
  const firstProductName = displayItems[0]?.productSnapshot?.name || displayItems[0]?.name || 'DD Mystery Box';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Cashfree Secure 256-Bit Encrypted Payment
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
          Payment Status
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Order Reference ID: <span className="text-white font-mono font-bold">#{orderIdDisplay}</span>
        </p>
      </div>

      {/* Main Payment Status Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6">
        {/* Status Indicator Banner */}
        {isPaid ? (
          <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">✓ Payment Received</span>
            <h3 className="text-2xl font-black text-white font-display">PAYMENT SUCCESSFUL</h3>
            <p className="text-xs text-emerald-300">
              Order Confirmed • Total Paid: <strong className="text-white font-bold">₹{totalAmount}</strong>
            </p>
            <p className="text-xs text-slate-300">
              Product: <strong className="text-pink-300 font-bold">{firstProductName}</strong>
            </p>
            {transactionId && (
              <p className="text-[11px] font-mono bg-emerald-900/60 py-1 px-3 rounded-lg inline-block text-emerald-200">
                Cashfree Ref: {transactionId}
              </p>
            )}
          </div>
        ) : isFailed ? (
          <div className="p-6 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 space-y-3 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Payment Failed</h3>
            <p className="text-xs text-rose-300">
              Your payment could not be processed. No final order was created. Please try again.
            </p>
          </div>
        ) : isCancelled ? (
          <div className="p-6 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 space-y-3 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Payment Cancelled</h3>
            <p className="text-xs text-amber-300">
              You cancelled or closed the Cashfree payment window. You can retry anytime below.
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 space-y-3 text-center">
            <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-white">Payment Pending Verification</h3>
            <p className="text-xs text-slate-300">
              Complete your payment using Cashfree's instant UPI, Cards, Net Banking or Wallets.
            </p>
          </div>
        )}

        {/* Order Summary Details */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            Order Summary
          </h4>
          <div className="space-y-2 text-xs text-slate-300">
            {displayItems.length > 0 ? (
              displayItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {item.productSnapshot?.name || item.name || 'DD Mystery Box'} x {item.quantity}
                  </span>
                  <span className="font-bold text-white">
                    ₹{(item.unitPrice || item.productSnapshot?.price || 0) * item.quantity}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-200">DD Mystery Box</span>
                <span className="font-bold text-white">₹{totalAmount}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Payable Amount</span>
              <span className="text-lg font-black text-pink-400">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {!isPaid && (
            <button
              onClick={handlePayNowWithCashfree}
              disabled={payingWithCashfree}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {payingWithCashfree ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Opening Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>{isFailed || isCancelled ? `TRY AGAIN (₹${totalAmount})` : `PAY ₹${totalAmount} NOW (CASHFREE)`}</span>
                </>
              )}
            </button>
          )}

          <div className="flex gap-3">
            {isPaid ? (
              <>
                <Link
                  to={`/order-success/${orderIdDisplay}`}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                >
                  <span>View My Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <span>Continue Shopping</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => fetchPaymentDetails(false)}
                  disabled={verifying}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-purple-400 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Verifying...' : 'Check Status'}</span>
                </button>

                <Link
                  to="/my-orders"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>My Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Cashfree Security Info Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Powered by Cashfree Payments. Instant Automated Confirmation.</span>
        </div>
      </div>
    </div>
  );
};
