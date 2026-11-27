import React, { useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div data-reveal className="text-center max-w-xl mx-auto space-y-3">
        <span className="pill pill-aurora px-3.5 py-1 text-xs font-semibold text-white/90 tracking-wide">
          <HelpCircle className="w-3.5 h-3.5 text-[#3DD9FF]" /> Help Center
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-shimmer">Frequently Asked Questions</h1>
        <p className="text-white/60 text-sm sm:text-base">Everything you need to know about customizing and ordering DD Mystery Boxes.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              data-reveal
              style={{ '--reveal-delay': `${idx * 70}ms` }}
            >
              <div className={`glass-2 rounded-[18px] transition-shadow duration-500 ${isOpen ? 'glass-glow' : ''}`}>
                <h2 className="text-base">
                  <button
                    id={`faq-q-${idx}`}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${idx}`}
                    className="w-full p-5 sm:px-6 text-left font-semibold text-white text-[15px] sm:text-base flex justify-between items-center gap-4 rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DD9FF]"
                  >
                    <span>{faq.q}</span>
                    <span className="accordion-icon glass-icon w-8 h-8 rounded-full text-white" aria-hidden="true">
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                </h2>
                <div
                  id={`faq-a-${idx}`}
                  role="region"
                  aria-labelledby={`faq-q-${idx}`}
                  className="accordion-panel"
                  data-open={isOpen}
                  inert={isOpen ? undefined : ''}
                >
                  <div>
                    <p className="mx-5 sm:mx-6 pb-5 pt-4 border-t border-white/10 text-sm text-white/65 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
