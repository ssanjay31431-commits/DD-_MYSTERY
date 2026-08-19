import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Calendar, ArrowRight, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.warn('API get orders notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto p-8"><CardSkeleton /><CardSkeleton /></div>;
  }

  const orderList = Array.isArray(orders) ? orders : [];

  if (orderList.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="No Orders Placed Yet"
          description="You haven't ordered any mystery boxes yet!"
          icon={Package}
          actionText="Order Your First Box"
          actionLink="/shop"
        />
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> 💳 Complete Your Payment
          </span>
        );
      case 'SCREENSHOT_SUBMITTED':
      case 'PAYMENT_VERIFICATION':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-blue-500/20 text-blue-300 border-blue-500/40 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" /> ⏳ Payment Verification is Going On...
          </span>
        );
      case 'PAYMENT_COMPLETED':
      case 'ORDER_CONFIRMED':
      case 'CONFIRMED':
      case 'Order Confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ✅ Confirmed Your Order
          </span>
        );
      case 'Cancelled':
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase border bg-rose-500/20 text-rose-300 border-rose-500/30">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase border bg-purple-500/20 text-purple-300 border-purple-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-display">My Orders</h1>
          <p className="text-xs text-slate-400">View and track all your DD Mystery Box orders.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orderList.map((order) => {
          const ordNumber = order.orderNumber || order.orderId || order._id;
          const status = order.orderStatus || 'PENDING_PAYMENT';
          const isPending = status === 'PENDING_PAYMENT' || status === 'SCREENSHOT_SUBMITTED' || status === 'PAYMENT_VERIFICATION';

          return (
            <div key={order._id || ordNumber} className="glass-panel p-6 rounded-3xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-amber-300 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    #{ordNumber}
                  </span>
                  {renderStatusBadge(status)}
                </div>

                <div className="text-xs text-slate-300 space-y-0.5">
                  <p className="font-bold text-white">
                    Items: {Array.isArray(order.items) ? order.items.map((i) => i.productSnapshot?.name || i.name).join(', ') : 'DD Mystery Box'}
                  </p>
                  <p className="text-slate-400">
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-left md:text-right">
                  <span className="block text-xs text-slate-400">Total Value</span>
                  <span className="text-xl font-black text-white font-display">₹{order.totalAmount || order.pricing?.totalAmount || 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <Link
                      to={`/payment?order_id=${ordNumber}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs uppercase shadow-md shadow-pink-500/20 flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay / Upload
                    </Link>
                  )}
                  <Link
                    to={`/track/${ordNumber}`}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase"
                  >
                    Track Status
                  </Link>
                  <Link
                    to={`/order/${order._id || ordNumber}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
