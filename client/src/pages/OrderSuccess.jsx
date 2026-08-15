import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import API from '../services/api';
import { LuckyRewardWheel } from '../components/order/LuckyRewardWheel';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    const syncAndFetchOrder = async () => {
      const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
      const found = localOrders.find((o) => o._id === orderId || o.orderId === orderId) || localOrders[0];

      if (found) {
        const confirmedOrder = {
          ...found,
          orderStatus: 'Confirmed',
          paymentStatus: 'Confirmed'
        };
        setOrder(confirmedOrder);

        // Update local storage
        const updatedOrders = [confirmedOrder, ...localOrders.filter(o => o._id !== confirmedOrder._id && o.orderId !== confirmedOrder.orderId)];
        localStorage.setItem('dd_orders', JSON.stringify(updatedOrders));

        // Sync order to Serverless API so Admin Dashboard displays it
        try {
          await API.post('/orders', confirmedOrder);
        } catch (e) {
          console.warn('Serverless order sync notice:', e.message);
        }
      } else {
        try {
          const { data } = await API.get(`/orders/${orderId}`);
          if (data && data._id && !data.message) {
            setOrder(data);
          }
        } catch (err) {
          console.warn('Fetch order notice:', err.message);
        }
      }
    };

    syncAndFetchOrder();
  }, [orderId]);

  const activeOrder = order || {};
  const advancePaid = Number(activeOrder.advancePaid) || (activeOrder.paymentMethod === 'full_cod' ? 0 : 100);
  const remainingCod = activeOrder.remainingCodAmount !== undefined ? Number(activeOrder.remainingCodAmount) : Math.max(0, (Number(activeOrder.totalAmount) || 499) - advancePaid);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center bg-gradient-to-b from-emerald-950/30 to-[#18132a] space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">
          Order Payment & Confirmation Verified!
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          Order Confirmed!
        </h1>

        <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-1 text-xs">
          <p className="text-slate-300">
            You have paid online: <strong className="text-emerald-400">₹{advancePaid}</strong>
          </p>
          <p className="text-amber-300 font-bold text-sm">
            Remaining COD Amount: ₹{remainingCod}
          </p>
          <p className="text-[11px] text-slate-400 italic pt-1">
            "Please pay ₹{remainingCod} to the delivery partner when your order is delivered."
          </p>
        </div>

        {activeOrder.orderId && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-sm font-bold">
            Order Reference ID: {activeOrder.orderId}
          </div>
        )}
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
            <p className="text-xs text-slate-300">
              {activeOrder.deliveryAddressSnapshot?.fullName || activeOrder.user?.name || 'Customer'}<br />
              {activeOrder.deliveryAddressSnapshot?.houseNo}, {activeOrder.deliveryAddressSnapshot?.street}, {activeOrder.deliveryAddressSnapshot?.area}<br />
              {activeOrder.deliveryAddressSnapshot?.city}, {activeOrder.deliveryAddressSnapshot?.state} - {activeOrder.deliveryAddressSnapshot?.pincode}<br />
              Phone: {activeOrder.deliveryAddressSnapshot?.mobileNumber || activeOrder.user?.phone}
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
                to={`/track/${activeOrder.orderId}`}
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
