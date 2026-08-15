import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    {
      q: 'What exactly is inside a DD Mystery Box?',
      a: 'Each mystery box is custom-curated based on your chosen theme, favorite colors, age, and personal preferences! It typically includes assorted chocolates, theme collectibles/toys, custom printed greeting card, stickers, confetti party pack, and a Lucky Reward scratch card.'
    },
    {
      q: 'Can I pick specific gifts for the box?',
      a: 'Yes! During customization, you can specify gift preferences (e.g. "loves anime action figures") as well as things to avoid (e.g. "no nut chocolates"). Our mystery gift team tailors every item to match your instructions.'
    },
    {
      q: 'How long does delivery take?',
      a: 'Standard delivery usually takes 3 to 5 business days across India. Express birthday dispatch is also available upon request.'
    },
    {
      q: 'How does the Lucky Reward system work?',
      a: 'Once an eligible order (₹299+) is confirmed, you get an interactive spin/reveal chance on our website to win instant cashback vouchers, free keychains, or 20% discount codes!'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major online payment options including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Digital Wallets powered by Razorpay.'
    }
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-black text-pink-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
          <HelpCircle className="w-3.5 h-3.5" /> Help Center
        </span>
        <h1 className="text-3xl font-black text-white font-display">Frequently Asked Questions</h1>
        <p className="text-slate-400 text-sm">Everything you need to know about customizing and ordering DD Mystery Boxes.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-panel rounded-2xl border border-purple-500/20 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left font-bold text-white text-base flex justify-between items-center hover:text-pink-400 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${openIdx === idx ? 'rotate-180 text-pink-400' : 'text-slate-500'}`} />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
