import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Save, Percent, DollarSign } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useToast } from '../../context/ToastContext';

export const AdminSettings = () => {
  const [codAdvanceType, setCodAdvanceType] = useState('percentage');
  const [codAdvanceValue, setCodAdvanceValue] = useState(20);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryMinAmount, setFreeDeliveryMinAmount] = useState(199);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        if (data) {
          setCodAdvanceType(data.codAdvanceType || 'percentage');
          setCodAdvanceValue(data.codAdvanceValue ?? 20);
          setDeliveryCharge(data.deliveryCharge ?? 0);
          setFreeDeliveryMinAmount(data.freeDeliveryMinAmount ?? 199);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/admin/settings', {
        codAdvanceType,
        codAdvanceValue: Number(codAdvanceValue),
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryMinAmount: Number(freeDeliveryMinAmount)
      });
      addToast('COD Advance & Business settings saved successfully!');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving settings', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Business & Payment Settings</h1>
            <p className="text-xs text-slate-400">Configure Advance Payment + Cash on Delivery (COD) rules without modifying source code.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-purple-500/30 max-w-2xl space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 1. Cash on Delivery (COD) Advance Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Advance Calculation Type</label>
                <select
                  value={codAdvanceType}
                  onChange={(e) => setCodAdvanceType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  <option value="percentage">Percentage (%) of Order Total</option>
                  <option value="fixed">Fixed Advance Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {codAdvanceType === 'percentage' ? 'Advance Percentage (%)' : 'Fixed Advance Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={codAdvanceType === 'percentage' ? 100 : 5000}
                  value={codAdvanceValue}
                  onChange={(e) => setCodAdvanceValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-sm"
                />
              </div>
            </div>

            {/* Live Calculation Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/20 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-amber-300 uppercase text-[10px] block">Live Setting Preview Calculation:</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block font-bold text-white">90s Kids Box (₹499)</span>
                  <span className="text-pink-400 font-bold block">
                    Advance: ₹{codAdvanceType === 'percentage' ? Math.round((499 * (codAdvanceValue / 100)) * 100) / 100 : Math.min(499, codAdvanceValue)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Remaining COD: ₹{codAdvanceType === 'percentage' ? Math.round((499 - (499 * (codAdvanceValue / 100))) * 100) / 100 : Math.max(0, 499 - codAdvanceValue)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block font-bold text-white">Choco Box (₹199)</span>
                  <span className="text-pink-400 font-bold block">
                    Advance: ₹{codAdvanceType === 'percentage' ? Math.round((199 * (codAdvanceValue / 100)) * 100) / 100 : Math.min(199, codAdvanceValue)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Remaining COD: ₹{codAdvanceType === 'percentage' ? Math.round((199 - (199 * (codAdvanceValue / 100))) * 100) / 100 : Math.max(0, 199 - codAdvanceValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              2. Delivery Fee Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Free Delivery Minimum Order (₹)</label>
                <input
                  type="number"
                  value={freeDeliveryMinAmount}
                  onChange={(e) => setFreeDeliveryMinAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration Settings
          </button>
        </form>
      </main>
    </div>
  );
};
