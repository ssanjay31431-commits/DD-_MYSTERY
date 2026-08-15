import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Award, RotateCw, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

export const LuckyRewardWheel = ({ orderId, onRewardClaimed }) => {
  const [spinning, setSpinning] = useState(false);
  const [rewardResult, setRewardResult] = useState(null);
  const [claimed, setClaimed] = useState(false);

  const handleSpin = async () => {
    if (spinning || claimed) return;
    setSpinning(true);

    try {
      // Simulate spinning delay for excitement
      setTimeout(async () => {
        const { data } = await API.post('/rewards/spin', { orderId });
        setRewardResult(data.reward);
        setSpinning(false);
        setClaimed(true);

        // Fire celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        if (onRewardClaimed) onRewardClaimed(data.reward);
      }, 2500);
    } catch (error) {
      setSpinning(false);
      console.error(error);
    }
  };

  return (
    <div className="relative glass-panel rounded-3xl p-8 border-2 border-amber-500/40 text-center overflow-hidden my-6 bg-gradient-to-b from-purple-950/40 to-[#18132a]">
      {/* Background Glow */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
        <Sparkles className="w-4 h-4" /> Birthday Mystery Lucky Reward <Sparkles className="w-4 h-4" />
      </div>

      <h3 className="text-2xl font-black text-white font-display mb-2">
        Try Your Lucky Reward!
      </h3>
      <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
        As a special birthday gift for your order, spin the mystery wheel to win cashback vouchers, free keychains, or exclusive discount coupons!
      </p>

      {/* Interactive Wheel / Reveal Visual */}
      <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
        <div
          className={`w-full h-full rounded-full border-4 border-amber-400 p-2 bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 shadow-2xl flex items-center justify-center transition-transform duration-[2500ms] ${
            spinning ? 'rotate-[1440deg] ease-in-out' : ''
          }`}
        >
          <div className="w-full h-full rounded-full bg-[#0f0c1b] flex flex-col items-center justify-center p-4 text-center">
            {rewardResult ? (
              <div className="animate-in zoom-in-90 duration-500">
                <Award className="w-10 h-10 text-amber-400 mx-auto mb-1 animate-bounce" />
                <span className="text-xs font-black text-amber-300 uppercase">{rewardResult.rewardType}</span>
              </div>
            ) : (
              <Gift className="w-12 h-12 text-pink-400 animate-float" />
            )}
          </div>
        </div>
      </div>

      {/* Spin / Result Action */}
      {!claimed ? (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="mt-4 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:opacity-95 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'Revealing Surprise...' : 'Spin & Claim Reward!'}
        </button>
      ) : (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 max-w-md mx-auto animate-in fade-in">
          <div className="flex items-center justify-center gap-2 font-bold text-base mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{rewardResult?.rewardTitle}</span>
          </div>
          {rewardResult?.rewardCode && (
            <p className="text-xs mt-1">
              Use Coupon Code: <strong className="text-amber-300 font-mono text-sm tracking-wider px-2 py-0.5 bg-slate-900 rounded">{rewardResult.rewardCode}</strong>
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Saved to your account profile rewards!</p>
        </div>
      )}
    </div>
  );
};
