import React from 'react';
import { Award, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminRewards = () => {
  const rewardRules = [
    { title: '₹500 Birthday Cashback Voucher', type: 'Cashback', code: 'REWARD500', weight: '10% Odds', terms: 'Applicable on orders above ₹999' },
    { title: 'Free Personalized Birthday Keychain', type: 'Gift Item', code: 'FREEKEYCHAIN', weight: '30% Odds', terms: 'Included automatically in next order box' },
    { title: '₹1,000 Mega Birthday Gift Card', type: 'Gift Card', code: 'MEGA1000', weight: '5% Odds', terms: 'Valid for 60 days on all box tiers' },
    { title: '20% OFF Next Birthday Surprise', type: 'Coupon', code: 'LUCKY20', weight: '35% Odds', terms: 'No minimum order required' },
    { title: 'Better Luck Next Time', type: 'Non-winning', code: '-', weight: '20% Odds', terms: 'Scratch card attempt logged' }
  ];

  return (
    <div className="flex min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Lucky Reward Configuration</h1>
            <p className="text-xs text-slate-400">Configure post-checkout reward odds, terms, and eligibility limits without misleading claims.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
          <h3 className="text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Active Reward Algorithm Pool
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardRules.map((rule, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">{rule.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    {rule.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Type: <span className="text-pink-300 font-bold">{rule.type}</span> | Code: <code className="text-white bg-slate-800 px-1 rounded">{rule.code}</code></p>
                <p className="text-[10px] text-slate-500 italic">Terms: {rule.terms}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
