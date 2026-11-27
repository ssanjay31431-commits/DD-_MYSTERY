import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Truck, Gift, Instagram, PhoneCall, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="px-3 sm:px-4 pt-20 pb-28 md:pb-6 text-white/60">
      <div data-reveal className="glass-2 max-w-7xl mx-auto rounded-[28px] px-5 sm:px-8 lg:px-12 pt-10 sm:pt-12 pb-8 overflow-hidden">
        <div className="glass-divider absolute inset-x-0 top-0" aria-hidden="true" />
        
        {/* Brand Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 sm:pb-12 border-b border-white/10">
          <div className="glass-1 flex items-center gap-4 p-4 rounded-[18px]">
            <div className="glass-icon w-12 h-12 rounded-[14px] text-[#FF4FA3]">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base font-display tracking-[-0.01em]">100% Customized</h4>
              <p className="text-xs text-white/55 leading-relaxed">Tailored to favorite colors, themes & personal birthday vibes.</p>
            </div>
          </div>

          <div className="glass-1 flex items-center gap-4 p-4 rounded-[18px]">
            <div className="glass-icon w-12 h-12 rounded-[14px] text-[#3DD9FF]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base font-display tracking-[-0.01em]">Fast Safe Shipping</h4>
              <p className="text-xs text-white/55 leading-relaxed">Secure packaging guaranteed to keep the birthday surprise safe.</p>
            </div>
          </div>

          <div className="glass-1 flex items-center gap-4 p-4 rounded-[18px]">
            <div className="glass-icon w-12 h-12 rounded-[14px] text-[#FFB84D]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base font-display tracking-[-0.01em]">Lucky Rewards</h4>
              <p className="text-xs text-white/55 leading-relaxed">Unlock scratch card rewards & cashbacks on eligible orders!</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 py-10 sm:py-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full btn-luminous flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-extrabold text-white tracking-[-0.02em]">
                DD MYSTERY BOX
              </span>
            </Link>
            <p className="font-accent italic text-lg text-aurora leading-snug">
              "Not Just a Gift. A Mystery Waiting to Be Yours!"
            </p>
            <p className="text-xs text-white/55 leading-relaxed">
              Crafting unforgettable surprise mystery boxes for birthdays, anniversaries, celebrations, nostalgia, thank-you moments, and every special occasion.
            </p>

            {/* Social & Contact Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/david_op468/"
                target="_blank"
                rel="noreferrer"
                className="glass-round w-11 h-11 hover:text-[#FF4FA3]"
                title="Instagram: @david_op468"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/917904279655?text=Hello%20DD%20Mystery%20Box!%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noreferrer"
                className="glass-round w-11 h-11"
                title="WhatsApp: +91 79042 79655"
              >
                <PhoneCall className="w-5 h-5 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="eyebrow mb-4">Quick Links</h5>
            <ul className="space-y-3 text-[13px]">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Mystery Boxes</Link></li>
              <li><Link to="/customize/default" className="hover:text-white transition-colors">Customize Your Box</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">Verified Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="eyebrow mb-4">Support & FAQ</h5>
            <ul className="space-y-3 text-[13px]">
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/my-orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/saved-addresses" className="hover:text-white transition-colors">Saved Shipping Addresses</Link></li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h5 className="eyebrow mb-4">Policies</h5>
            <ul className="space-y-3 text-[13px]">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund / Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} DD MYSTERY BOX. All Rights Reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#FF4FA3] fill-[#FF4FA3] inline" />
            <span>for magical birthday surprises</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
