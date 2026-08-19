import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, Calendar, CreditCard, Sparkles, ArrowLeft, ShieldAlert } from 'lucide-react';
import API from '../services/api';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useToast } from '../context/ToastContext';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        if (data && data._id && data.totalAmount !== undefined && !data.message) {
          setOrder(data);
        } else {
          const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
          const found = localOrders.find((o) => o._id === id || o.orderId === id);
          setOrder(found || null);
        }
      } catch (err) {
        console.warn('Fetch order notice, checking local orders:', err.message);
        const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
        const found = localOrders.find((o) => o._id === id || o.orderId === id);
        setOrder(found || null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.put(`/orders/${order._id}/cancel`, { reason: 'Cancelled by customer from order details' });
      addToast('Order cancelled successfully', 'info');
      setOrder({ ...order, orderStatus: 'Cancelled' });
    } catch (err) {
      const localOrders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
      const updated = localOrders.map(o => (o._id === order._id || o.orderId === order.orderId) ? { ...o, orderStatus: 'Cancelled' } : o);
      localStorage.setItem('dd_orders', JSON.stringify(updated));
      setOrder({ ...order, orderStatus: 'Cancelled' });
      addToast('Order cancelled successfully', 'info');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-8"><CardSkeleton /></div>;
  if (!order) return <div className="text-center py-20 text-white font-bold">Order Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/my-orders" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Order ID</span>
            <h1 className="text-2xl font-black text-white font-display">{order.orderId}</h1>
            <span className="text-xs text-slate-400">Placed on: {new Date(order.createdAt).toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {order.orderStatus}
            </span>
            {['PENDING', 'ORDER PLACED', 'CONFIRMED', 'ORDER CONFIRMED', 'PREPARING'].includes((order.orderStatus || '').toUpperCase()) && (
              <button
                onClick={handleCancelOrder}
                className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <OrderTimeline currentStatus={order.orderStatus} trackingHistory={order.trackingHistory} />

        {/* Items & Customizations List */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-pink-400 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Ordered Birthday Mystery Boxes
          </h3>

          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.productSnapshot?.image || item.product?.image || '/favicon.svg'} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.productSnapshot?.name || item.product?.name || 'Birthday Box'}</h4>
                    <p className="text-xs text-pink-300 font-semibold">
                      For: {item.customizationSnapshot?.recipientName || 'Recipient'} • Theme: {item.customizationSnapshot?.theme || 'Theme'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Color: {item.customizationSnapshot?.favoriteColor || 'Purple'} | Qty: {item.quantity}
                    </p>
                    {item.customizationSnapshot?.personalMessage && (
                      <p className="text-[11px] text-slate-300 italic mt-1">"{item.customizationSnapshot.personalMessage}"</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-white font-display">₹{(item.unitPrice || item.product?.price || 499) * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Payment Snapshots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-pink-400" /> Delivery Address
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">{order.deliveryAddressSnapshot?.fullName || order.user?.name}</strong><br />
              {[
                order.deliveryAddressSnapshot?.houseNo,
                order.deliveryAddressSnapshot?.street,
                order.deliveryAddressSnapshot?.area,
                order.deliveryAddressSnapshot?.landmark ? `(Landmark: ${order.deliveryAddressSnapshot.landmark})` : ''
              ].filter(Boolean).join(', ')}<br />
              {order.deliveryAddressSnapshot?.city}, {order.deliveryAddressSnapshot?.state} - {order.deliveryAddressSnapshot?.pincode}<br />
              <span className="font-mono text-slate-400">Mobile: {order.deliveryAddressSnapshot?.mobileNumber || order.user?.phone}</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-purple-400" /> Payment Details
            </h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p>Status: <span className="font-bold text-emerald-400">{order.paymentInfo?.status || order.paymentStatus || 'CONFIRMED'}</span></p>
              <p>Method: {order.paymentInfo?.method === 'FULL' ? 'Full Online Payment' : 'Advance Payment'}</p>
              <p>Paid Online: <span className="font-bold text-emerald-400">₹{order.pricing?.amountPaid !== undefined ? order.pricing.amountPaid : (order.amountPaid || order.advancePaid || 0)}</span></p>
              <p>Remaining Balance: <span className="font-bold text-amber-300">₹{order.pricing?.remainingBalance !== undefined ? order.pricing.remainingBalance : (order.remainingBalance !== undefined ? order.remainingBalance : (order.remainingCodAmount || 0))}</span></p>
              <p>Total Order Amount: <span className="font-bold text-white">₹{order.totalAmount || order.pricing?.totalAmount || 0}</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
