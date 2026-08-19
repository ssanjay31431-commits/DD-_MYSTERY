import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, CreditCard, Share2, Phone, Instagram, MessageSquare, QrCode } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [paymentMethodName, setPaymentMethodName] = useState('Manual UPI');
  const [upiId, setUpiId] = useState('david468468@airtel');
  const [upiName, setUpiName] = useState('Sagariya David S');

  const [codAdvanceType, setCodAdvanceType] = useState('percentage');
  const [codAdvanceValue, setCodAdvanceValue] = useState(20);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryMinAmount, setFreeDeliveryMinAmount] = useState(199);
  const [instagramLink, setInstagramLink] = useState('https://www.instagram.com/david_op468/');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 79042 79655');

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/admin/settings');
      if (data) {
        setPaymentMethodName(data.paymentMethodName || 'Manual UPI');
        setUpiId(data.upiId || 'david468468@airtel');
        setUpiName(data.upiName || 'Sagariya David S');
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
      await API.put('/admin/settings', {
        paymentMethodName,
        upiId,
        upiName,
        codAdvanceType,
        codAdvanceValue: Number(codAdvanceValue),
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryMinAmount: Number(freeDeliveryMinAmount),
        instagramLink,
        whatsappNumber
      });
      addToast('Payment & Admin Settings updated successfully!');
    } catch (err) {
      addToast('Settings update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto text-white">
      <div className="pb-4 border-b border-purple-500/20">
        <h1 className="text-2xl font-black text-white font-display">Payment & Admin Settings</h1>
        <p className="text-xs text-slate-400">Configure manual UPI payment account details, Instagram links, and WhatsApp support number.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        
        {/* Section 1: Manual UPI Payment Settings */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4 bg-slate-900/40">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
            <QrCode className="w-4 h-4 text-pink-400" /> Payment Settings (Manual GPay UPI)
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block mb-1 font-bold text-slate-300">Payment Method</label>
              <input
                type="text"
                readOnly
                value={paymentMethodName}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-pink-400 font-extrabold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-300">UPI ID (Admin Payment Account) *</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. david468468@airtel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-300">UPI Account Display Name *</label>
              <input
                type="text"
                required
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="e.g. Sagariya David S"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-[11px] text-purple-200">
              🔒 Every order will generate a unique dynamic UPI QR using <strong className="text-white">{upiId}</strong> with the exact order total pre-filled automatically.
            </div>
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
    </div>
  );
};
