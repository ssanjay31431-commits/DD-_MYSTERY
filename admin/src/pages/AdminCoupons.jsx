import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(299);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [usageLimit, setUsageLimit] = useState(100);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/coupons');
      if (Array.isArray(data)) {
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);

    try {
      await API.post('/coupons', {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: Number(maxDiscount),
        expiryDate: expiry,
        usageLimit: Number(usageLimit)
      });
      addToast(`Coupon '${code.toUpperCase()}' created!`);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await API.delete(`/coupons/${id}`);
      addToast('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">Manage Discount Coupons</h1>
            <p className="text-xs text-slate-400">Create promotional promo codes with percentage/fixed discounts & limits.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create New Coupon
          </button>
        </div>

        <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Usage Limit</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                    No promo coupons created yet. Click "Create New Coupon" to offer customer discounts.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-300 text-sm">{c.code}</td>
                    <td className="p-4 font-bold text-white">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </td>
                    <td className="p-4">₹{c.minOrderAmount}</td>
                    <td className="p-4">{c.usageLimit || 100} times</td>
                    <td className="p-4 text-pink-400 font-bold">{c.timesUsed || 0}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(c._id)} className="text-rose-400 hover:text-rose-300 font-bold">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Coupon">
          <form onSubmit={handleCreate} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1 font-semibold">Coupon Code (Uppercase)</label>
              <input type="text" required placeholder="MYSTERY10" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white uppercase font-mono font-bold focus:border-pink-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Discount Type</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Discount Value</label>
                <input type="number" required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Min Order Amount (₹)</label>
                <input type="number" required value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Max Discount Limit (₹)</label>
                <input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase">
              Save Promo Coupon
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
