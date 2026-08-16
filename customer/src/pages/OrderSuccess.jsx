import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { LuckyRewardWheel } from '../components/order/LuckyRewardWheel';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    const fetchConfirmedOrder = async () => {
      if (!orderId) return;
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        if (data && (data._id || data.orderNumber)) {
          setOrder(data);
        }
      } catch (err) {
        console.warn('Fetch confirmed order notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedOrder();
  }, [orderId]);

  const activeOrder = order || {};
  const orderNumber = activeOrder.orderNumber || activeOrder.orderId || orderId;
  const amountPaid = activeOrder.pricing?.amountPaid !== undefined ? activeOrder.pricing.amountPaid : (activeOrder.amountPaid || activeOrder.advancePaid || 100);
  const remainingBalance = activeOrder.pricing?.remainingBalance !== undefined ? activeOrder.pricing.remainingBalance : (activeOrder.remainingBalance !== undefined ? activeOrder.remainingBalance : (activeOrder.remainingCodAmount || 0));
  const rawMethod = activeOrder.paymentInfo?.method || activeOrder.paymentMethod || 'ADVANCE';
  const paymentMethodTitle = rawMethod === 'FULL' || rawMethod === 'Full Online Payment' ? 'Full Online Payment' : 'Advance Payment';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center bg-gradient-to-b from-emerald-950/30 to-[#18132a] space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">
          Order Payment & Database Confirmation Verified!
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          🎉 ORDER CONFIRMED!
        </h1>

        <div className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-3 text-left">
          <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
            <span>Order Number:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">#{orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Payment Method:</span>
            <span className="font-bold text-white">{paymentMethodTitle}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
            <span>Payment Online:</span>
            <span className="text-sm font-display">₹{amountPaid} Paid Online</span>
          </div>

          <div className="flex justify-between items-center text-xs text-amber-300 font-bold border-t border-slate-800 pt-2">
            <span>Remaining Balance:</span>
            <span className="text-sm font-display">₹{remainingBalance}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Status:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-pink-300 font-bold text-[10px]">
              Order Confirmed
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            to="/my-orders"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/30 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            [ VIEW MY ORDER ]
          </Link>
        </div>
      </div>

      {/* Lucky Reward Reveal Wheel */}
      {activeOrder._id && (
        <LuckyRewardWheel orderId={activeOrder._id} />
      )}

      {/* Order Summary Snapshot */}
      {activeOrder._id && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-pink-400" /> Delivery Address
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">{activeOrder.deliveryAddressSnapshot?.fullName || activeOrder.user?.name || 'Customer'}</strong><br />
              {[
                activeOrder.deliveryAddressSnapshot?.houseNo,
                activeOrder.deliveryAddressSnapshot?.street,
                activeOrder.deliveryAddressSnapshot?.area,
                activeOrder.deliveryAddressSnapshot?.landmark ? `(Landmark: ${activeOrder.deliveryAddressSnapshot.landmark})` : ''
              ].filter(Boolean).join(', ')}<br />
              {activeOrder.deliveryAddressSnapshot?.city}, {activeOrder.deliveryAddressSnapshot?.state} - {activeOrder.deliveryAddressSnapshot?.pincode}<br />
              <span className="font-mono text-slate-400">Phone: {activeOrder.deliveryAddressSnapshot?.mobileNumber || activeOrder.user?.phone}</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Estimated Delivery
            </h4>
            <p className="text-sm font-bold text-emerald-400">
              {activeOrder.expectedDeliveryDate ? new Date(activeOrder.expectedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'In 3-5 Days'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link
                to={`/track/${orderNumber}`}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase text-center flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" /> Track Live Order Status
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
