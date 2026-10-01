import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, Share2, Instagram, MessageSquare, CreditCard } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [instagramLink, setInstagramLink] = useState('https://www.instagram.com/david_op468/');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 79042 79655');

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/admin/settings');
      if (data) {
        setInstagramLink(data.instagramLink || 'https://www.instagram.com/david_op468/');
        setWhatsappNumber(data.whatsappNumber || '+91 79042 79655');
      }
    } catch (err) {
      console.error('[Fetch Admin Settings Error]', err);
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
        instagramLink,
        whatsappNumber,
        paymentMethodName: 'Cashfree Payment Gateway'
      });
      addToast('Admin & Store Settings updated successfully!');
    } catch (err) {
      console.error('[Update Settings Error]', err);
      addToast('Settings update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="pb-4 border-b border-purple-500/20">
          <h1 className="text-xl sm:text-2xl font-black text-white font-display">Store & Payment Settings</h1>
          <p className="text-xs text-slate-400">Configure your store details, social links, and view active payment gateway status.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          {/* Section 1: Cashfree Payment Gateway Active Status */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4 bg-slate-900/40">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Payment Gateway Integration
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cashfree Payments SDK (Active)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Online payments are handled via Cashfree Payments Gateway using server-side automated verification. Sensitive credentials are securely loaded from backend server environment variables.
              </p>
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
