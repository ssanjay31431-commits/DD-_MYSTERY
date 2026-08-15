import React from 'react';

export const PrivacyPolicy = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white font-display">Privacy Policy</h1>
    <p className="text-xs text-slate-400">Last updated: August 2026</p>
    <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-4 text-xs leading-relaxed">
      <h3 className="text-sm font-bold text-white">1. Information We Collect</h3>
      <p>At DD MYSTERY BOX, we collect customer information such as name, email, phone number, shipping address, and customization details (recipient name, birthday date, preferences) solely for fulfilling your personalized surprise order.</p>

      <h3 className="text-sm font-bold text-white">2. Payment Security</h3>
      <p>Payments are processed through 256-bit encrypted Razorpay payment gateways. We never store credit/debit card numbers or UPI PINs on our servers.</p>

      <h3 className="text-sm font-bold text-white">3. Data Protection</h3>
      <p>Your recipient's birthday photos and personal birthday messages are confidential and strictly used for box printing purposes.</p>
    </div>
  </div>
);

export const TermsAndConditions = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white font-display">Terms & Conditions</h1>
    <p className="text-xs text-slate-400">Last updated: August 2026</p>
    <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-4 text-xs leading-relaxed">
      <h3 className="text-sm font-bold text-white">1. Product Customization</h3>
      <p>DD MYSTERY BOX curates items based on user preferences. Exact contents may vary while maintaining the specified budget tier value.</p>

      <h3 className="text-sm font-bold text-white">2. Lucky Reward Terms</h3>
      <p>Lucky scratch rewards are generated algorithmically per eligible order. Rewards cannot be exchanged for raw cash outside specified cashback codes.</p>

      <h3 className="text-sm font-bold text-white">3. Copyright & Brand</h3>
      <p>"DD MYSTERY BOX" and tagline "Your Birthday. Your Theme. Your Surprise!" are protected trademarks.</p>
    </div>
  </div>
);

export const RefundPolicy = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-300">
    <h1 className="text-3xl font-black text-white font-display">Refund & Cancellation Policy</h1>
    <p className="text-xs text-slate-400">Last updated: August 2026</p>
    <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 space-y-4 text-xs leading-relaxed">
      <h3 className="text-sm font-bold text-white">1. Order Cancellation</h3>
      <p>Orders can be cancelled free of charge before the box state moves to 'Packed' or 'Shipped'.</p>

      <h3 className="text-sm font-bold text-white">2. Damaged or Incorrect Box Refund</h3>
      <p>If the mystery box arrives damaged or with incorrect personalization details, contact support within 48 hours for a free replacement or 100% refund to original payment source.</p>

      <h3 className="text-sm font-bold text-white">3. Refund Processing Time</h3>
      <p>Approved refunds are credited back via Razorpay within 3-5 business days.</p>
    </div>
  </div>
);
