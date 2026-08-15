import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, Clock, Truck, ShieldCheck, Send, RefreshCw, User, MapPin } from 'lucide-react';
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

  // Send Email & SMS State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [templateType, setTemplateType] = useState('ORDER_CONFIRMATION');
  const [smsTemplateType, setSmsTemplateType] = useState('ORDER_CONFIRMATION');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

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

  const handleMarkCodCollected = async () => {
    try {
      const { data } = await API.put(`/orders/admin/${id}/status`, {
        orderStatus: order.orderStatus,
        codStatus: 'Collected'
      });
      setOrder(data);
      addToast('COD payment marked as Collected ✓');
    } catch (err) {
      addToast('Update failed', 'error');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      const emailRecipient = order.deliveryAddressSnapshot?.email || order.user?.email;
      const { data } = await API.post('/admin/notifications/send-email', {
        orderId: order.orderId,
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

  const handleSendSms = async (e) => {
    e.preventDefault();
    setSendingSms(true);

    try {
      const phoneRecipient = order.deliveryAddressSnapshot?.mobileNumber || order.user?.phone;
      const { data } = await API.post('/admin/notifications/send-sms', {
        orderId: order.orderId,
        recipientPhone: phoneRecipient,
        templateType: smsTemplateType,
        message: smsMessage
      });

      if (data?.success) {
        addToast(`✅ SMS sent successfully to ${phoneRecipient}`);
        setShowSmsModal(false);
        setSmsMessage('');
      } else {
        const errorDetail = data?.error || data?.message || 'SMS delivery failed';
        addToast(`❌ SMS failed: ${errorDetail}`, 'error');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.error || err.response?.data?.message || 'Failed to send SMS';
      addToast(`❌ SMS failed: ${errorDetail}`, 'error');
    } finally {
      setSendingSms(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0c0a17]">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center text-slate-400">Loading Order Details...</main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-[#0c0a17]">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center text-rose-400">Order Not Found</main>
      </div>
    );
  }

  const statuses = [
    'Order Placed',
    'Order Confirmed',
    'Preparing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const recipientEmail = order.deliveryAddressSnapshot?.email || order.user?.email || 'N/A';
  const recipientPhone = order.deliveryAddressSnapshot?.mobileNumber || order.user?.phone || 'N/A';

  return (
    <div className="flex min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
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
              <h1 className="text-2xl font-black text-white font-display">
                ORDER #{order.orderId}
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
              onClick={() => setShowSmsModal(true)}
              className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-pink-500/20"
            >
              <Send className="w-4 h-4" /> Send SMS
            </button>
          </div>
        </div>

        {/* 8-Stage Order Tracking Status Controls */}
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
                  order.orderStatus === st
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
            <p className="text-xs text-slate-400 font-mono">Email: {recipientEmail}</p>
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
              📞 Contact: {recipientPhone}
            </p>
            {order.deliveryAddressSnapshot?.latitude && order.deliveryAddressSnapshot?.longitude && (
              <a
                href={`https://www.google.com/maps?q=${order.deliveryAddressSnapshot.latitude},${order.deliveryAddressSnapshot.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold underline mt-1"
              >
                📍 Open GPS Location in Google Maps ({order.deliveryAddressSnapshot.latitude.toFixed(4)}, {order.deliveryAddressSnapshot.longitude.toFixed(4)})
              </a>
            )}
          </div>
        </div>

        {/* Payment Calculation & COD Collection Status */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2">
            Payment Breakdown (Advance + COD)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
              <span className="text-lg font-black text-white font-display">₹{order.totalAmount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Advance Paid Online</span>
              <span className="text-lg font-black text-emerald-400 font-display">₹{order.advancePaid || order.advanceRequired}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Remaining COD</span>
              <span className="text-lg font-black text-amber-400 font-display">₹{order.remainingCodAmount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">COD Collection</span>
              <button
                onClick={handleMarkCodCollected}
                className="mt-1 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-colors"
              >
                {order.codStatus === 'Collected' ? 'Collected ✓' : 'Mark COD Collected'}
              </button>
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
              <div key={idx} className="flex items-center gap-3 text-xs p-2 rounded-xl bg-slate-900/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white w-40">{hist.status}</span>
                <span className="text-slate-400">{hist.comment || hist.message}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">{new Date(hist.timestamp || hist.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Dispatch Modal */}
        <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Send Brevo Email Notification">
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1 font-bold text-white">Recipient Email (Auto-populated)</label>
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

        {/* SMS Dispatch Modal */}
        <Modal isOpen={showSmsModal} onClose={() => setShowSmsModal(false)} title="Send SMS Notification to Customer">
          <form onSubmit={handleSendSms} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1 font-bold text-white">Recipient Phone Number (Auto-populated)</label>
              <input
                type="text"
                disabled
                value={recipientPhone}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-white">Select SMS Template</label>
              <select
                value={smsTemplateType}
                onChange={(e) => setSmsTemplateType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              >
                <option value="ORDER_CONFIRMATION">🎁 Order Confirmation SMS</option>
                <option value="PAYMENT_CONFIRMATION">💳 Payment Confirmation SMS</option>
                <option value="SHIPMENT">🚚 Shipment Tracking SMS</option>
                <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery Reminder SMS</option>
                <option value="CUSTOM_SMS">✏️ Custom SMS Message</option>
              </select>
            </div>

            {smsTemplateType === 'CUSTOM_SMS' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-white">Custom SMS Text</label>
                  <span className={`text-[11px] font-mono font-bold ${smsMessage.length > 160 ? 'text-rose-400' : 'text-pink-400'}`}>
                    Character Counter: {smsMessage.length} / 160
                  </span>
                </div>
                <textarea
                  rows="4"
                  maxLength="160"
                  required
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type concise SMS message here (max 160 characters)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={sendingSms}
              className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" /> {sendingSms ? 'Dispatching SMS...' : 'Send SMS Now'}
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
