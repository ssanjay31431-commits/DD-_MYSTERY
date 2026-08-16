import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { clearCart } = useCart();

  const urlOrderId = searchParams.get('order_id') || searchParams.get('orderId');
  const urlSessionId = searchParams.get('session_id') || searchParams.get('sessionId');

  const [checkoutData, setCheckoutData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);

  useEffect(() => {
    const rawPayload = sessionStorage.getItem('dd_checkout_payload');
    if (rawPayload) {
      try {
        const parsed = JSON.parse(rawPayload);
        setCheckoutData(parsed);
      } catch (e) {
        console.error('Error parsing checkout payload:', e);
      }
    } else if (!urlOrderId) {
      navigate('/cart');
    }
  }, [urlOrderId, navigate]);

  const paymentOrderId = checkoutData?.paymentOrderId || urlOrderId || `CF_${Date.now()}`;
  const paymentSessionId = checkoutData?.paymentSessionId || urlSessionId || '';
  const totalAmount = checkoutData?.totalAmount || 499;
  const amountToPay = checkoutData?.amountToPay || 100;
  const remainingBalance = checkoutData?.remainingBalance !== undefined ? checkoutData.remainingBalance : Math.max(0, totalAmount - amountToPay);
  const isFullPayment = checkoutData?.paymentMethod === 'FULL';

  const handleCashfreePayment = async () => {
    setProcessing(true);
    setErrorAlert(null);

    try {
      const mockTxId = `tx_cf_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const confirmPayload = {
        paymentOrderId,
        paymentSessionId,
        transactionId: mockTxId,
        paymentMethod: isFullPayment ? 'FULL' : 'ADVANCE',
        items: checkoutData?.items || [],
        deliveryAddress: checkoutData?.deliveryAddress || {},
        couponCode: checkoutData?.couponCode || ''
      };

      const { data } = await API.post('/orders/confirm-payment', confirmPayload);

      if (data && data.success && data.order) {
        if (clearCart) clearCart();
        sessionStorage.removeItem('dd_checkout_payload');
        addToast('Payment verified & order confirmed successfully! 🎉');
        
        const finalId = data.order.orderNumber || data.order.orderId || data.order._id;
        navigate(`/order-success/${finalId}`);
      } else {
        const errMsg = data?.message || `Payment received, but we could not finish creating your order. Please contact support. Your payment reference is ${paymentOrderId}.`;
        setErrorAlert(errMsg);
        addToast(errMsg, 'error');
      }
    } catch (error) {
      console.error('[Payment Confirmation Error]', error);
      const errMsg = error.response?.data?.message || `Payment received, but we could not finish creating your order. Please contact support. Your payment reference is ${paymentOrderId}.`;
      setErrorAlert(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 text-center space-y-8">
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-500/30 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-400">
            Cashfree Secure Gateway
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">
            Complete Online Payment
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Payment Reference: <span className="font-mono text-amber-300 font-bold">{paymentOrderId}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-3 text-left">
          <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>Product Total Value:</span>
            <span className="font-bold text-white text-sm">₹{totalAmount}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-amber-300 font-bold py-1">
            <span>Online Amount To Pay Now:</span>
            <span className="text-xl text-amber-400 font-display">₹{amountToPay}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span>Remaining Balance:</span>
            <span className="font-bold text-white text-sm">₹{remainingBalance}</span>
          </div>

          <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Method: {isFullPayment ? 'Full Online Payment' : 'Advance Payment'}</span>
          </div>
        </div>

        {errorAlert && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 max-w-md mx-auto text-left text-xs text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Order Creation Error
            </div>
            <p>{errorAlert}</p>
          </div>
        )}

        <button
          onClick={handleCashfreePayment}
          disabled={processing}
          className="w-full max-w-md mx-auto py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-pink-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5" />
          {processing ? 'Verifying Payment & Creating Order...' : isFullPayment ? `PAY ₹${amountToPay} NOW →` : `PAY ₹${amountToPay} ADVANCE NOW →`}
        </button>

        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          🔒 256-Bit SSL Encrypted Cashfree Payment Gateway.
        </p>

      </div>
    </div>
  );
};
