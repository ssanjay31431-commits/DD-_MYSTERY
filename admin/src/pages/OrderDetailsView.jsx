import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, Clock, Truck, ShieldCheck, RefreshCw, User, MapPin, CreditCard, Package, Trash2 } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';

export const OrderDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Send Email State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [templateType, setTemplateType] = useState('ORDER_CONFIRMATION');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      addToast('Failed to fetch order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThisOrder = async () => {
    const ordNum = order?.orderNumber || order?.orderId || id;
    if (!window.confirm(`Are you sure you want to delete Order #${ordNum}? This will remove the order from the database permanently.`)) {
      return;
    }

    try {
      const { data } = await API.delete(`/admin/orders/${order._id || id}`);
      if (data && data.success) {
        addToast(`🗑️ Order #${ordNum} deleted successfully!`);
        navigate('/admin/orders');
      } else {
        addToast(data?.message || 'Failed to delete order', 'error');
      }
    } catch (err) {
      console.error('[Delete Order Error]', err);
      addToast(err.response?.data?.message || 'Error deleting order', 'error');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await API.put(`/orders/admin/${id}/status`, { orderStatus: newStatus });
      setOrder(data);
      addToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      const emailRecipient = order.deliveryAddressSnapshot?.email || order.user?.email;
      const { data } = await API.post('/admin/notifications/send-email', {
        orderId: order.orderNumber || order.orderId,
        recipientEmail: emailRecipient,
        templateType,
        subject: customSubject,
        message: customMessage
      });

      if (data?.success) {
        addToast(`✅ Email sent successfully to ${emailRecipient}`);
        setShowEmailModal(false);
        setCustomSubject('');
        setCustomMessage('');
      } else {
        const errorDetail = data?.error || data?.message || 'Email delivery failed';
        addToast(`❌ Email failed: ${errorDetail}`, 'error');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.error || err.response?.data?.message || 'Failed to send email';
      addToast(`❌ Email failed: ${errorDetail}`, 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
        <AdminSidebar />
        <main className="flex-1 w-full max-w-full min-w-0 p-8 text-center text-slate-400">Loading Order Details...</main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
        <AdminSidebar />
        <main className="flex-1 w-full max-w-full min-w-0 p-8 text-center text-rose-400">Order Not Found</main>
      </div>
    );
  }

  const statuses = [
    'ORDER PLACED',
    'CONFIRMED',
    'PREPARING',
    'PACKED',
    'SHIPPED',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  const recipientEmail = order.deliveryAddressSnapshot?.email || order.user?.email || 'N/A';
  const recipientPhone = order.deliveryAddressSnapshot?.mobileNumber || order.user?.phone || 'N/A';
  const ordNumber = order.orderNumber || order.orderId;
  const total = order.pricing?.totalAmount || order.totalAmount || 0;
  const paid = order.pricing?.amountPaid !== undefined ? order.pricing.amountPaid : (order.amountPaid || order.advancePaid || 0);
  const rem = order.pricing?.remainingBalance !== undefined ? order.pricing.remainingBalance : (order.remainingBalance !== undefined ? order.remainingBalance : (order.remainingCodAmount || 0));
  const isFull = order.paymentInfo?.method === 'FULL' || order.paymentMethod === 'FULL' || order.paymentMethod === 'full_online';
  const cashfreeRef = order.paymentInfo?.cashfreePaymentId || order.paymentInfo?.cashfreeOrderId || order.paymentInfo?.transactionId || 'Verified Gateway';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                ORDER #{ordNumber}
              </h1>
              <p className="text-xs text-slate-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Mail className="w-4 h-4" /> Send Email
            </button>
            <button
              onClick={handleDeleteThisOrder}
              className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Delete This Order"
            >
              <Trash2 className="w-4 h-4" /> Delete Order
            </button>
          </div>
        </div>

        {/* Order Status Controls */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <h3 className="text-sm font-bold text-amber-300 font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Update Order Status & Timeline
          </h3>

          <div className="flex flex-wrap gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  (order.orderStatus || '').toUpperCase() === st
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 ring-2 ring-pink-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Address Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-pink-400" /> Customer Information
            </h3>
            <p className="text-xs text-slate-300 font-bold">{order.deliveryAddressSnapshot?.fullName || order.user?.name}</p>
            <p className="text-xs text-slate-400 font-mono break-all">Email: {recipientEmail}</p>
            <p className="text-xs text-slate-400 font-mono">Phone: {recipientPhone}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Delivery Address
              </span>
              {order.deliveryAddressSnapshot?.addressType && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-pink-300 text-[10px] font-bold">
                  {order.deliveryAddressSnapshot.addressType}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-200 font-bold">{order.deliveryAddressSnapshot?.fullName}</p>
            <p className="text-xs text-slate-300">
              {[
                order.deliveryAddressSnapshot?.houseNo,
                order.deliveryAddressSnapshot?.street,
                order.deliveryAddressSnapshot?.area,
                order.deliveryAddressSnapshot?.landmark ? `(Landmark: ${order.deliveryAddressSnapshot.landmark})` : ''
              ].filter(Boolean).join(', ') || order.deliveryAddressSnapshot?.streetAddress}
            </p>
            <p className="text-xs text-slate-300">
              {[
                order.deliveryAddressSnapshot?.city,
                order.deliveryAddressSnapshot?.district !== order.deliveryAddressSnapshot?.city ? order.deliveryAddressSnapshot?.district : '',
                order.deliveryAddressSnapshot?.state
              ].filter(Boolean).join(', ')} - {order.deliveryAddressSnapshot?.pincode}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              📞 Mobile: {recipientPhone}
            </p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
            <Package className="w-4 h-4 text-pink-400" /> Ordered Items & Customizations
          </h3>

          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.productSnapshot?.image || item.product?.image || '/favicon.svg'} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white">{item.productSnapshot?.name || item.product?.name || 'DD Mystery Box'}</h4>
                    <p className="text-pink-300 break-words">For: {item.customizationSnapshot?.recipientName || 'Recipient'} | Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-black text-white font-display text-sm self-end sm:self-center">₹{(item.unitPrice || item.price || 499) * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown (Strictly No COD) */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" /> Payment & Financial Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
              <span className="text-xl font-black text-white font-display">₹{total}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Paid Online</span>
              <span className="text-xl font-black text-emerald-400 font-display">₹{paid}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Remaining Balance</span>
              <span className="text-xl font-black text-amber-400 font-display">₹{rem}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30">
              <span className="text-[10px] text-purple-400 uppercase font-bold block">Payment Method</span>
              <span className="text-xs font-bold text-white block mt-1">{isFull ? 'Full Online Payment' : 'Advance Payment'}</span>
              <span className="text-[10px] font-mono text-slate-400 block break-all">Ref: {cashfreeRef}</span>
            </div>
          </div>
        </div>

        {/* Tracking History Timeline */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2">
            Order Status Tracking History
          </h3>

          <div className="space-y-2">
            {order.trackingHistory?.map((hist, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-white block sm:inline mr-2">{hist.status}</span>
                    <span className="text-slate-400 text-[11px] block sm:inline break-words">{hist.comment || hist.message}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 sm:ml-auto self-end sm:self-center">
                  {new Date(hist.timestamp || hist.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Dispatch Modal */}
        <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Send Brevo Email Notification">
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1 font-bold text-white">Recipient Email</label>
              <input
                type="email"
                disabled
                value={recipientEmail}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-white">Select Email Template</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              >
                <option value="ORDER_CONFIRMATION">🎁 Order Confirmation Email</option>
                <option value="PAYMENT_CONFIRMATION">💳 Payment Confirmation Email</option>
                <option value="PREPARING">📦 Workshop Preparing Email</option>
                <option value="PACKED">📦 Order Packed Email</option>
                <option value="SHIPPED">🚚 Order Shipped Email</option>
                <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery Email</option>
                <option value="DELIVERED">🎉 Order Delivered Email</option>
                <option value="CANCELLED">⚠️ Order Cancellation Email</option>
                <option value="CUSTOM_EMAIL">✏️ Custom Email Message</option>
              </select>
            </div>

            {templateType === 'CUSTOM_EMAIL' && (
              <>
                <div>
                  <label className="block mb-1 font-bold text-white">Custom Subject</label>
                  <input
                    type="text"
                    required
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter custom email subject..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-white">Custom Message Body</label>
                  <textarea
                    rows="4"
                    required
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your custom email message here..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={sendingEmail}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <Mail className="w-4 h-4" /> {sendingEmail ? 'Dispatching Brevo Email...' : 'Send Brevo Email Now'}
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
