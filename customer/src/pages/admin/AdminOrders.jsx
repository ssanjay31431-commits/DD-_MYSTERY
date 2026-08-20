import React, { useEffect, useState } from 'react';
import { Search, Eye, Edit, CheckCircle2, ShieldAlert } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [commentUpdate, setCommentUpdate] = useState('');
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data } = await API.get(`/admin/orders?status=${filterStatus}&search=${searchTerm}`);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, searchTerm]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusUpdate || !selectedOrder) return;

    try {
      await API.put(`/admin/orders/${selectedOrder._id}/status`, {
        orderStatus: statusUpdate,
        comment: commentUpdate
      });
      addToast(`Order ${selectedOrder.orderId} updated to ${statusUpdate}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto min-w-0">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Manage Customer Orders</h1>
            <p className="text-xs text-slate-400">View customization blueprints, update workshop status & shipping tracking.</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  filterStatus === st
                    ? 'bg-pink-500 text-white border-pink-400 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order ID / Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer & Phone</th>
                <th className="p-4">Recipient Name</th>
                <th className="p-4">Theme</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => {
                const item = ord.items?.[0] || {};
                const custom = item.customizationSnapshot || {};

                return (
                  <tr key={ord._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-300">{ord.orderId}</td>
                    <td className="p-4">
                      <span className="block font-bold text-white">{ord.deliveryAddressSnapshot?.fullName || ord.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{ord.deliveryAddressSnapshot?.mobileNumber || ord.user?.phone}</span>
                    </td>
                    <td className="p-4 font-bold text-pink-400">{custom.recipientName || 'Rahul'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                        {custom.theme || 'Anime'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">₹{ord.totalAmount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-900/50 text-purple-200 border border-purple-500/30">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setStatusUpdate(ord.orderStatus);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      >
                        Manage Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal for Order Customization Blueprint & Status update */}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Blueprint: ${selectedOrder?.orderId}`}>
          {selectedOrder && (
            <div className="space-y-6 text-xs text-slate-300">
              
              {/* Customization Details Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
                <h4 className="font-bold text-pink-400 uppercase text-xs">Customization Specifications</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-slate-200 border-b border-slate-800 pb-2 mb-2">
                    <p>Box: <strong className="text-white">{item.productSnapshot?.name}</strong> (Qty: {item.quantity})</p>
                    <p>Recipient: <strong className="text-amber-300">{item.customizationSnapshot?.recipientName}</strong> (Turning {item.customizationSnapshot?.age})</p>
                    <p>Birthday Date: {item.customizationSnapshot?.birthdayDate}</p>
                    <p>Theme: <span className="text-purple-300 font-bold">{item.customizationSnapshot?.theme}</span> | Favorite Color: <span className="text-pink-300 font-bold">{item.customizationSnapshot?.favoriteColor}</span></p>
                    <p>Personal Message: <em className="text-slate-300 font-serif">"{item.customizationSnapshot?.personalMessage}"</em></p>
                    <p>Gift Preferences: {item.customizationSnapshot?.giftPreferences}</p>
                    <p>Things to Avoid: {item.customizationSnapshot?.thingsToAvoid}</p>
                  </div>
                ))}
              </div>

              {/* Delivery Address Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                <h4 className="font-bold text-amber-400 uppercase text-xs mb-1">📍 Delivery Address</h4>
                <p className="font-bold text-white">{selectedOrder.deliveryAddressSnapshot?.fullName}</p>
                <p className="text-slate-300">
                  {[
                    selectedOrder.deliveryAddressSnapshot?.houseNo,
                    selectedOrder.deliveryAddressSnapshot?.street,
                    selectedOrder.deliveryAddressSnapshot?.area,
                    selectedOrder.deliveryAddressSnapshot?.landmark ? `(Landmark: ${selectedOrder.deliveryAddressSnapshot.landmark})` : ''
                  ].filter(Boolean).join(', ') || selectedOrder.deliveryAddressSnapshot?.streetAddress}
                </p>
                <p className="text-slate-300">
                  {[
                    selectedOrder.deliveryAddressSnapshot?.city,
                    selectedOrder.deliveryAddressSnapshot?.district,
                    selectedOrder.deliveryAddressSnapshot?.state
                  ].filter(Boolean).join(', ')} - {selectedOrder.deliveryAddressSnapshot?.pincode}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">📞 Mobile: {selectedOrder.deliveryAddressSnapshot?.mobileNumber || selectedOrder.user?.phone}</p>
                {selectedOrder.deliveryAddressSnapshot?.latitude && selectedOrder.deliveryAddressSnapshot?.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedOrder.deliveryAddressSnapshot.latitude},${selectedOrder.deliveryAddressSnapshot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] text-blue-400 hover:text-blue-300 underline font-bold mt-1"
                  >
                    📍 Open GPS Location in Maps ({selectedOrder.deliveryAddressSnapshot.latitude.toFixed(4)}, {selectedOrder.deliveryAddressSnapshot.longitude.toFixed(4)})
                  </a>
                )}
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs uppercase">Update Workshop Status</h4>
                <div>
                  <label className="block text-slate-400 mb-1">New Order Status</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    {statuses.filter((s) => s !== 'All').map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tracking Comment / Courier Partner Info</label>
                  <input
                    type="text"
                    placeholder="e.g. Packed with anime keychain & shipped via BlueDart (AWB: 123456)"
                    value={commentUpdate}
                    onChange={(e) => setCommentUpdate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
                  Save Status & Trigger Notification
                </button>
              </form>

            </div>
          )}
        </Modal>

      </main>
    </div>
  );
};
