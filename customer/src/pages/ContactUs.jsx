import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Thank you! Your message has been sent to DD Mystery Box support team.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-white font-display">Contact DD Mystery Box</h1>
        <p className="text-slate-400 text-sm">Have a question or special birthday bulk request? Send us a message or chat on WhatsApp!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6">
          <h3 className="text-lg font-bold text-white font-display">Get in Touch</h3>
          
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400">Email Support</span>
                <span className="font-bold text-white">support@ddmysterybox.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400">WhatsApp / Direct Support</span>
                <a
                  href="https://wa.me/917904279655?text=Hello%20DD%20Mystery%20Box!"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-400 hover:underline"
                >
                  +91 79042 79655 (Click to Chat)
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400">Instagram Handle</span>
                <a
                  href="https://www.instagram.com/david_op468/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-pink-400 hover:underline"
                >
                  @david_op468
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400">Mystery Workshop</span>
                <span className="font-bold text-white">DD Mystery Box HQ, Tech Park Hub, India</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white font-display">Send a Message</h3>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Your Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Your Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Message / Inquiry</label>
            <textarea required rows="4" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
};
