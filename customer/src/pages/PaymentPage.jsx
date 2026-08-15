import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/cart');
        return;
      }
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error(err);
        addToast('Order details not found', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      // 1. Create Razorpay order for backend-calculated Advance Amount ONLY
      const { data: payOrder } = await API.post('/payments/create-order', {
        orderId: order.orderId
      });

      if (payOrder.isMockMode || !window.Razorpay) {
        // Safe Test/Mock Mode fallback execution
        addToast('Executing safe Development Test Payment Mode...', 'info');
        setTimeout(async () => {
          const { data: verifyRes } = await API.post('/payments/verify', {
            dbOrderId: order._id,
            razorpay_order_id: payOrder.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_valid_sig',
            isMockMode: true
          });

          if (verifyRes.success) {
            addToast('Advance payment verified successfully!');
            navigate(`/order-success/${order._id}`);
          }
          setProcessing(false);
        }, 1500);
        return;
      }

      // 2. Open standard Razorpay Checkout Modal
      const options = {
        key: payOrder.key,
        amount: payOrder.amount, // Advance amount in paise
        currency: payOrder.currency,
        name: 'DD MYSTERY BOX',
        description: `Advance Payment for ${order.orderId}`,
        image: '/favicon.svg',
        order_id: payOrder.id,
        handler: async function (response) {
          try {
            // Backend verify signature
            const { data: verifyRes } = await API.post('/payments/verify', {
              dbOrderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMockMode: false
            });

            if (verifyRes.success) {
              addToast('Advance payment signature verified successfully!');
              navigate(`/order-success/${order._id}`);
            }
          } catch (err) {
            addToast('Advance payment verification failed on backend', 'error');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: order.deliveryAddressSnapshot?.fullName || '',
          email: order.user?.email || '',
          contact: order.deliveryAddressSnapshot?.mobileNumber || ''
        },
        theme: {
          color: '#ec4899'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setProcessing(false);
      addToast(error.response?.data?.message || 'Payment initialization error', 'error');
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto p-8"><CardSkeleton /></div>;
  }

  if (!order) return null;

  const advanceRequired = order.advanceRequired || Math.round(order.totalAmount * 0.2);
  const remainingCod = order.remainingCodAmount || Math.round(order.totalAmount - advanceRequired);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 text-center space-y-8">
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-500/30 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-400">
            Advance Payment Gateway
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">
            Pay Advance for Order {order.orderId}
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Pay initial advance online to confirm your mystery box order. Remaining balance collected via Cash on Delivery.
          </p>
        </div>

        {/* Detailed Breakdown Box */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-3 text-left">
          <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>Order Value Total:</span>
            <span className="font-bold text-white text-sm">₹{order.totalAmount}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-amber-300 font-bold py-1">
            <span>Advance Required Now (Online):</span>
            <span className="text-xl text-amber-400 font-display">₹{advanceRequired}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span>Remaining Amount (Cash on Delivery):</span>
            <span className="font-bold text-white text-sm">₹{remainingCod}</span>
          </div>

          <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Method: Pay Advance + Cash on Delivery</span>
          </div>
        </div>

        {/* Razorpay Advance Action Button */}
        <button
          onClick={handleRazorpayPayment}
          disabled={processing}
          className="w-full max-w-md mx-auto py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-pink-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5" />
          {processing ? 'Processing Payment...' : `Pay ₹${advanceRequired} Now`}
        </button>

        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          You will only be charged ₹{advanceRequired} online. Please pay remaining ₹{remainingCod} to the delivery partner when your order arrives.
        </p>

      </div>
    </div>
  );
};
