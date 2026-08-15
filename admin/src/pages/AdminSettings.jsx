import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, CreditCard, Share2, Phone, Instagram, MessageSquare } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [codAdvanceType, setCodAdvanceType] = useState('percentage');
  const [codAdvanceValue, setCodAdvanceValue] = useState(20);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryMinAmount, setFreeDeliveryMinAmount] = useState(199);
  const [instagramLink, setInstagramLink] = useState('https://www.instagram.com/david_op468/');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 79042 79655');

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      if (data) {
        setCodAdvanceType(data.codAdvanceType || 'percentage');
        setCodAdvanceValue(data.codAdvanceValue ?? 20);
        setDeliveryCharge(data.deliveryCharge ?? 0);
        setFreeDeliveryMinAmount(data.freeDeliveryMinAmount ?? 199);
        setInstagramLink(data.instagramLink || 'https://www.instagram.com/david_op468/');
        setWhatsappNumber(data.whatsappNumber || '+91 79042 79655');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.put('/settings', {
        codAdvanceType,
        codAdvanceValue: Number(codAdvanceValue),
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryMinAmount: Number(freeDeliveryMinAmount),
        instagramLink,
        whatsappNumber
      });
      addToast('Business & Advance COD Settings updated!');
    } catch (err) {
      addToast('Settings update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0c0a17]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="pb-4 border-b border-purple-500/20">
          <h1 className="text-2xl font-black text-white font-display">Business & Advance COD Settings</h1>
          <p className="text-xs text-slate-400">Configure advance payment calculation, free shipping thresholds, Instagram links, and WhatsApp support number.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          {/* Section 1: Advance + COD Calculation Settings */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Advance Payment Calculation
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-300">Advance Type</label>
                <select
                  value={codAdvanceType}
                  onChange={(e) => setCodAdvanceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">
                  {codAdvanceType === 'percentage' ? 'Advance Percentage (%)' : 'Fixed Advance Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  value={codAdvanceValue}
                  onChange={(e) => setCodAdvanceValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300">
              💡 Example: For ₹499 box at 20% advance → Customer pays <strong className="text-white">₹99.80</strong> online, remaining balance <strong className="text-white">₹399.20</strong> paid on delivery.
            </div>
          </div>

          {/* Section 2: Contact & Social Settings */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              <Share2 className="w-4 h-4 text-pink-400" /> Official Contact & Social Media
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-300 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-400" /> Instagram Profile Link
                </label>
                <input
                  type="url"
                  required
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Support Number
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </form>

      </main>
    </div>
  );
};
