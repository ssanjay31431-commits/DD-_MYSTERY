import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Truck, Gift, Instagram, PhoneCall, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0b0814] border-t border-purple-500/20 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800/80">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-display">100% Customized</h4>
              <p className="text-xs text-slate-400">Tailored to favorite colors, themes & personal birthday vibes.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-display">Fast Safe Shipping</h4>
              <p className="text-xs text-slate-400">Secure packaging guaranteed to keep the birthday surprise safe.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-display">Lucky Rewards</h4>
              <p className="text-xs text-slate-400">Unlock scratch card rewards & cashbacks on eligible orders!</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-black text-white tracking-wider">
                DD MYSTERY BOX
              </span>
            </Link>
            <p className="text-sm italic text-pink-400 font-semibold">
              "Your Birthday. Your Theme. Your Surprise!"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crafting unforgettable personalized birthday mystery boxes filled with gift collectibles, chocolates, custom theme graphics, and memory keepsakes.
            </p>

            {/* Social & Contact Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/david_op468/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-pink-400 hover:border-pink-500 transition-all hover:scale-110"
                title="Instagram: @david_op468"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/917904279655?text=Hello%20DD%20Mystery%20Box!%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all hover:scale-110"
                title="WhatsApp: +91 79042 79655"
              >
                <PhoneCall className="w-5 h-5 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-display text-white font-bold text-sm tracking-wider uppercase mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-pink-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-pink-400 transition-colors">Shop All Mystery Boxes</Link></li>
              <li><Link to="/customize/default" className="hover:text-pink-400 transition-colors">Customize Your Box</Link></li>
              <li><Link to="/track" className="hover:text-pink-400 transition-colors">Track Your Order</Link></li>
              <li><Link to="/reviews" className="hover:text-pink-400 transition-colors">Verified Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-display text-white font-bold text-sm tracking-wider uppercase mb-4">Support & FAQ</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/faq" className="hover:text-pink-400 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-pink-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/my-orders" className="hover:text-pink-400 transition-colors">Order History</Link></li>
              <li><Link to="/saved-addresses" className="hover:text-pink-400 transition-colors">Saved Shipping Addresses</Link></li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h5 className="font-display text-white font-bold text-sm tracking-wider uppercase mb-4">Policies</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/privacy-policy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-pink-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-pink-400 transition-colors">Refund / Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DD MYSTERY BOX. All Rights Reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
            <span>for magical birthday surprises</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
