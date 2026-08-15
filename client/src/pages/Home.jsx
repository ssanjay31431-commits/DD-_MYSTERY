import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Heart, ShieldCheck, Star, ArrowRight, Truck, PartyPopper, CheckCircle2, ChevronRight, HelpCircle, Eye } from 'lucide-react';
import API from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, themeRes] = await Promise.all([
          API.get('/products'),
          API.get('/themes')
        ]);
        setProducts(prodRes.data);
        setThemes(themeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nostalgiaBox = products.find((p) => p.price === 499) || products[0];
  const chocoBox = products.find((p) => p.price === 199) || products[1];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:py-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-500/20 via-purple-600/20 to-amber-400/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>The #1 Birthday & Nostalgia Surprise Box</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                DD MYSTERY BOX
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300">
                  "Your Birthday. Your Theme. Your Surprise!"
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Relive childhood memories or surprise someone special with our **90s Kids Nostalgia Edition (₹499)** or **DD Choco Mystery Box (₹199)**.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-2xl shadow-pink-500/30 hover:scale-105 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5" /> Explore Mystery Boxes
                </Link>

                <Link
                  to={nostalgiaBox ? `/customize/${nostalgiaBox._id}` : '/shop'}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-slate-200 hover:text-white hover:border-purple-500 font-bold text-sm text-center flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
                >
                  Customize Surprise <Sparkles className="w-4 h-4 text-pink-400" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black text-white font-display">10,000+</span>
                  <span className="text-[11px] text-slate-400 font-medium">Happy Surprises</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black text-amber-400 font-display">4.9 ★</span>
                  <span className="text-[11px] text-slate-400 font-medium">Customer Rating</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black text-emerald-400 font-display">Advance + COD</span>
                  <span className="text-[11px] text-slate-400 font-medium">Pay 20% Online</span>
                </div>
              </div>
            </div>

            {/* Right Visual Hero Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Product 1 Card */}
              <div className="glass-panel p-5 rounded-3xl border border-pink-500/30 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white font-black text-[9px] uppercase tracking-wider self-start">
                  90s NOSTALGIA
                </span>
                <div>
                  <h3 className="font-black text-white text-base font-display">90s KIDS EDITION</h3>
                  <p className="text-[11px] text-amber-300 italic font-semibold">"Relive Your Childhood!"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Poppins, Boomer, Water Game, Glass Marbles & 16+ Items.</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xl font-black text-white font-display">₹499</span>
                  <Link
                    to={nostalgiaBox ? `/product/${nostalgiaBox._id}` : '/shop'}
                    className="px-3 py-1.5 rounded-xl bg-pink-500 text-white font-bold text-[10px] uppercase flex items-center gap-1"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Product 2 Card */}
              <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase tracking-wider self-start">
                  CHOCO SURPRISE
                </span>
                <div>
                  <h3 className="font-black text-white text-base font-display">CHOCO MYSTERY BOX</h3>
                  <p className="text-[11px] text-pink-400 italic font-semibold">"5 Surprise Gifts Inside!"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Large Brand Chocolates + MrBeast Surprise Chance!</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xl font-black text-white font-display">₹199</span>
                  <Link
                    to={chocoBox ? `/product/${chocoBox._id}` : '/shop'}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[10px] uppercase flex items-center gap-1"
                  >
                    View Details
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Featured Mystery Boxes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block mb-1">
              Featured Products
            </span>
            <h2 className="text-3xl font-black text-white font-display">
              Our Signature Mystery Boxes
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1">
            View All Boxes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How Advance + COD Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#18132a] to-pink-950/40">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">
              Easy Payment Option
            </span>
            <h2 className="text-3xl font-black text-white font-display">
              How Advance + Cash on Delivery Works
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Pay just a small initial advance online. Pay the remaining balance in cash when your box is delivered!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 font-black text-xs inline-flex items-center justify-center mb-3">1</span>
              <h4 className="font-bold text-white text-sm mb-1">Select Your Box</h4>
              <p className="text-xs text-slate-400">Pick ₹499 90s Kids Box or ₹199 Choco Box and view "What's Inside".</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-black text-xs inline-flex items-center justify-center mb-3">2</span>
              <h4 className="font-bold text-white text-sm mb-1">Pay Advance (e.g. 20%)</h4>
              <p className="text-xs text-slate-400">Pay only ₹99.80 (for ₹499 box) or ₹39.80 (for ₹199 box) via Razorpay online.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs inline-flex items-center justify-center mb-3">3</span>
              <h4 className="font-bold text-white text-sm mb-1">Remaining COD on Delivery</h4>
              <p className="text-xs text-slate-400">Pay the remaining balance in cash to the delivery partner when your surprise arrives!</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
