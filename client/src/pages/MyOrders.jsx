import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import API from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
      try {
        const { data } = await API.get('/orders');
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(localOrders);
        }
      } catch (err) {
        console.warn('API get orders notice, loading local orders:', err.message);
        setOrders(localOrders);
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
          description="You haven't ordered any birthday surprise mystery boxes yet!"
          icon={Package}
          actionText="Order Your First Box"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-display">My Orders</h1>
          <p className="text-xs text-slate-400">View and track all your birthday mystery box orders.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orderList.map((order) => (
          <div key={order._id || order.orderId} className="glass-panel p-6 rounded-3xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-amber-300 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {order.orderId}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : order.orderStatus === 'Cancelled'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-0.5">
                <p className="font-bold text-white">
                  Items: {Array.isArray(order.items) ? order.items.map((i) => i.productSnapshot?.name || i.product?.name).join(', ') : 'Mystery Box'}
                </p>
                <p className="text-slate-400">
                  Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="block text-xs text-slate-400">Total Amount</span>
                <span className="text-xl font-black text-pink-400 font-display">₹{order.totalAmount}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/track/${order.orderId}`}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase"
                >
                  Track Status
                </Link>
                <Link
                  to={`/order/${order._id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs"
                >
                  Details
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
