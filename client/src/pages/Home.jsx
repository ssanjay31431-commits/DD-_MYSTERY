import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Heart, ShieldCheck, Star, ArrowRight, Truck, PartyPopper, CheckCircle2, ChevronRight, HelpCircle, Eye } from 'lucide-react';
import API from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setProductsError('');

    API.get('/products', { params: { limit: 3 }, signal: controller.signal })
      .then(({ data }) => setProducts(Array.isArray(data) ? data.slice(0, 3) : data.products || []))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Home product request failed:', err);
        setProductsError(err.response?.data?.message || 'Products could not be loaded. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Marvel Edition is the hero ad, so fetch it directly instead of hoping it is among the first products.
  const [marvelProduct, setMarvelProduct] = useState(null);
  const [marvelLoading, setMarvelLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    API.get('/products', { params: { search: 'marvel', limit: 5 }, signal: controller.signal })
      .then(({ data }) => {
        const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
        setMarvelProduct(list.find((p) => /marvel/i.test(p.name || '')) || null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) console.error('Marvel product request failed:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setMarvelLoading(false);
      });
    return () => controller.abort();
  }, []);

  const marvelSavings = marvelProduct?.originalPrice > marvelProduct?.price
    ? Math.round((1 - marvelProduct.price / marvelProduct.originalPrice) * 100)
    : 0;

  const nostalgiaBox = products.find((p) => p.price === 499) || products[0];
  const diwaliProduct = products.find((product) =>
    /diwali/i.test([product.name, product.tagline, product.tag].filter(Boolean).join(' '))
  );
  const diwaliCampaignActive =
    Date.now() >= Date.parse('2026-10-29T00:00:00+05:30') &&
    Date.now() < Date.parse('2026-11-09T00:00:00+05:30');

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full max-w-full pt-8 pb-16 lg:py-24">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-tr from-sky-400/20 via-cyan-300/10 to-violet-400/20 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] bg-violet-400/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="frost-glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sky-100 text-xs font-bold tracking-wide max-w-full">
                <span className="shrink-0" aria-hidden="true">❄️</span>
                <span className="truncate">The Surprise Box for Every Moment</span>
              </div>

              {/* Logo & Heading Container */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-6">
                
                {/* Official DD Mystery Box Logo */}
                <div className="relative shrink-0 group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-200 via-sky-400 to-violet-400 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition duration-500"></div>
                  <div className="frost-glass relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full p-1.5 overflow-hidden flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="DD Mystery Box Official Logo"
                      className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Main Hero Heading */}
                <div>
                  <h1 className="font-display text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                    <span className="ice-text drop-shadow-[0_2px_20px_rgba(125,211,252,0.25)]">DD MYSTERY BOX</span>
                    <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-200 to-violet-300 text-lg sm:text-3xl lg:text-4xl font-extrabold">
                      "Not Just a Gift.
                      <br className="hidden sm:inline" /> A Mystery Waiting to Be Yours!"
                    </span>
                  </h1>
                </div>

              </div>

              {/* Description */}
              <p className="text-slate-300/90 text-xs sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                From birthdays and anniversaries to friendship, celebrations, nostalgia, thank-you moments, or simply 'just because' — choose a mystery box made to turn ordinary moments into unforgettable surprises.
              </p>

              {/* Highlight Callout */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-semibold text-sky-200 py-1 select-none">
                <span className="text-base sm:text-lg shrink-0" aria-hidden="true">🎁</span>
                <span>One Box. Endless Reasons to Surprise.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/shop"
                  className="ice-button w-full sm:w-auto h-12 px-7 rounded-2xl font-extrabold text-sm tracking-wide hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" /> <span>Explore Mystery Boxes</span>
                </Link>

                <Link
                  to={nostalgiaBox ? `/customize/${nostalgiaBox._id}` : '/shop'}
                  className="frost-glass frost-sheen w-full sm:w-auto h-12 px-7 rounded-2xl text-sky-50 hover:text-white hover:border-sky-200/40 font-bold text-sm text-center flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-sky-300" /> <span>Customize Surprise</span>
                </Link>
              </div>

              {/* Occasion Tags List */}
              <div className="pt-1">
                <p className="text-xs font-bold text-sky-300 uppercase tracking-[0.2em] mb-2">
                  Surprise Someone For:
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
                  {[
                    '🎂 Birthday',
                    '💍 Anniversary',
                    '🤝 Friendship',
                    '💖 Valentine\'s Day',
                    '🙏 Thank You',
                    '🎉 Congratulations',
                    '🪔 Festivals',
                    '🕹️ Nostalgia',
                    '🌟 Self-Reward',
                    '✨ Just Because'
                  ].map((occasion, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-slate-200 text-xs font-medium hover:border-sky-200/40 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="frost-glass mt-2 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black ice-text font-display">10,000+</span>
                  <span className="text-xs text-slate-400 font-medium">Happy Surprises</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black text-sky-200 font-display">4.9 ★</span>
                  <span className="text-xs text-slate-400 font-medium">Customer Rating</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-xl font-black text-teal-200 font-display">Full Payment</span>
                  <span className="text-xs text-slate-400 font-medium">100% Safe & Instant</span>
                </div>
              </div>
            </div>

            {/* Right Visual Hero Feature Cards */}
            {diwaliCampaignActive ? (
              <div className="diwali-ad relative min-h-[390px] rounded-2xl border border-amber-300/30 bg-gradient-to-br from-[#35121f] via-[#20132c] to-[#100d1c] p-6 sm:p-8 flex flex-col items-center justify-between overflow-hidden shadow-[0_25px_80px_rgba(245,158,11,0.12)]">
                <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
                <div className="relative z-10 w-full text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-200">
                    <Sparkles className="h-4 w-4" /> Diwali Week · Limited Edition
                  </span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-black font-display text-white">
                    {diwaliProduct?.name ? diwaliProduct.name.replace(/eddition/gi, 'Edition') : 'Diwali Edition Mystery Box'}
                  </h2>
                  <p className="mt-2 text-sm text-amber-100/80">Celebrate the season with a sky full of sparkle.</p>
                </div>

                <div className="diwali-stage relative z-10 my-2 flex h-48 w-full items-center justify-center" role="img" aria-label="Colorful Diwali fireworks launch and burst into sparkling lights across a night sky">
                  <div className="diwali-rocket diwali-rocket-one" aria-hidden="true" />
                  <div className="diwali-rocket diwali-rocket-two" aria-hidden="true" />
                  <div className="diwali-rocket diwali-rocket-three" aria-hidden="true" />
                  <div className="diwali-firework diwali-firework-one" aria-hidden="true" />
                  <div className="diwali-firework diwali-firework-two" aria-hidden="true" />
                  <div className="diwali-firework diwali-firework-three" aria-hidden="true" />
                  <div className="diwali-firework diwali-firework-four" aria-hidden="true" />
                  <div className="diwali-sparkler diwali-sparkler-left" aria-hidden="true" />
                  <div className="diwali-sparkler diwali-sparkler-right" aria-hidden="true" />
                  <div className="diwali-ground-glow" aria-hidden="true" />
                  <div className="diwali-skyline" aria-hidden="true">🪔　✨　🪔</div>
                  <div className="diwali-caption" aria-hidden="true">HAPPY DIWALI</div>
                </div>

                <div className="relative z-10 flex w-full flex-col items-center gap-3 text-center">
                  <p className="text-sm font-bold text-amber-100">
                    {diwaliProduct?.price ? `Diwali surprise box · ₹${diwaliProduct.price}` : 'A festive surprise, made to delight'}
                  </p>
                  <Link
                    to={diwaliProduct ? `/product/${diwaliProduct._id}` : '/shop'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400/20 border border-amber-400/40 px-6 py-3.5 text-sm font-bold tracking-wide text-amber-200 backdrop-blur-md shadow-md transition-all hover:bg-amber-400/30 hover:border-amber-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                  >
                    <Gift className="h-4 w-4" /> Open Your Surprise · Order Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
            <div className="order-first lg:order-none lg:self-start">
              {marvelLoading ? (
                <div className="marvel-ad h-[460px] animate-pulse" aria-label="Loading Marvel Edition" />
              ) : marvelProduct ? (
                <Link
                  to={`/product/${marvelProduct._id}`}
                  className="marvel-ad group block p-5 sm:p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
                  aria-label={`${marvelProduct.name}: view details and order for ₹${marvelProduct.price}`}
                >
                  {/* Top ribbon */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-600/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" aria-hidden="true" /> New Drop
                    </span>
                    {marvelSavings > 0 && (
                      <span className="rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                        Save {marvelSavings}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4">
                    <div className="order-2 sm:order-1 text-left">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-red-300">Limited Edition</p>
                      <h2 className="marvel-title font-display text-4xl sm:text-5xl font-black leading-none tracking-tight">
                        MARVEL
                        <span className="block text-2xl sm:text-3xl tracking-[0.25em]">EDITION</span>
                      </h2>
                      <div className="mt-3 flex items-center gap-1 text-amber-300 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-300" /> {marvelProduct.rating || 4.9}
                        <span className="text-slate-400 font-medium">({marvelProduct.numReviews || 0} reviews)</span>
                      </div>
                    </div>
                    <div className="order-1 sm:order-2 mx-auto w-40 sm:w-44 aspect-square">
                      <img
                        src={`${marvelProduct.image}${marvelProduct.image?.includes('?') ? '&' : '?'}width=640`}
                        alt={marvelProduct.name}
                        className="marvel-image h-full w-full rounded-3xl object-cover border border-white/15"
                        onError={(e) => { e.currentTarget.src = marvelProduct.image; }}
                      />
                    </div>
                  </div>

                  {/* Perks */}
                  <ul className="mt-5 space-y-2 text-left">
                    <li className="marvel-ticket flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3">
                      <span className="text-xl" aria-hidden="true">🎟️</span>
                      <span className="text-sm font-extrabold text-amber-100">
                        2 FREE Avengers: Doomsday movie tickets
                      </span>
                    </li>
                    <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                      <span className="text-xl" aria-hidden="true">🦸</span>
                      <span className="text-sm font-semibold text-slate-100">₹500+ worth of Marvel goodies inside</span>
                    </li>
                    <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                      <span className="text-xl" aria-hidden="true">🚚</span>
                      <span className="text-sm font-semibold text-slate-100">
                        {marvelProduct.deliveryCharge === 0 ? 'Free delivery' : 'Fast delivery'} to your doorstep
                      </span>
                    </li>
                  </ul>

                  {/* Price + CTA */}
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <div className="text-center sm:text-left">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-black text-white">₹{marvelProduct.price}</span>
                        {marvelProduct.originalPrice > marvelProduct.price && (
                          <span className="text-base font-bold text-slate-400 line-through">₹{marvelProduct.originalPrice}</span>
                        )}
                      </div>
                      {marvelProduct.stock > 0 && marvelProduct.stock <= 50 && (
                        <p className="text-[11px] font-bold text-red-300">Only {marvelProduct.stock} left!</p>
                      )}
                    </div>
                    <span className="marvel-cta inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-wide transition-transform group-hover:scale-105">
                      Grab It Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>
            )}

          </div>
        </div>
      </section>

      {/* Featured Mystery Boxes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-sky-300 uppercase tracking-[0.25em] block mb-1">
              Featured Products
            </span>
            <h2 className="text-3xl font-black ice-text font-display">
              Our Signature Mystery Boxes
            </h2>
          </div>
          <Link to="/shop" className="frost-glass px-4 py-2 rounded-full text-sky-100 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
            View All Boxes <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : productsError ? (
          <div className="text-center text-sm text-rose-300" role="alert">
            <p>{productsError}</p>
            <button onClick={() => setReloadKey((key) => key + 1)} className="mt-3 font-bold text-sky-300 hover:text-white">Retry</button>
          </div>
        ) : products.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/shop"
                className="frost-glass frost-sheen inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sky-50 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Browse Full Mystery Collection <ArrowRight className="w-4 h-4 text-sky-300" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">No products are currently available.</p>
        )}
      </section>

      {/* How Ordering & Full Payment Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="frost-glass p-8 sm:p-12 rounded-[2rem]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-teal-200 uppercase tracking-[0.25em] block mb-1">
              Secure &amp; Fast Process
            </span>
            <h2 className="text-3xl font-black ice-text font-display">
              How Full Online Payment Works
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Simple 3-step checkout. Complete full online payment securely and get fast dispatch of your mystery surprise box!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="frost-glass frost-glass-hover p-6 rounded-3xl">
              <span className="w-10 h-10 rounded-full bg-sky-300/15 border border-sky-200/30 text-sky-200 font-extrabold text-sm inline-flex items-center justify-center mb-3">1</span>
              <h3 className="font-bold text-white text-sm mb-1">Select &amp; Customize Box</h3>
              <p className="text-xs text-slate-400">Pick your favorite mystery box tier or customize birthday details in seconds.</p>
            </div>

            <div className="frost-glass frost-glass-hover p-6 rounded-3xl">
              <span className="w-10 h-10 rounded-full bg-violet-300/15 border border-violet-200/30 text-violet-200 font-extrabold text-sm inline-flex items-center justify-center mb-3">2</span>
              <h3 className="font-bold text-white text-sm mb-1">Instant Full Online Payment</h3>
              <p className="text-xs text-slate-400">Complete 100% full online payment for your item safely at checkout.</p>
            </div>

            <div className="frost-glass frost-glass-hover p-6 rounded-3xl">
              <span className="w-10 h-10 rounded-full bg-teal-300/15 border border-teal-200/30 text-teal-200 font-extrabold text-sm inline-flex items-center justify-center mb-3">3</span>
              <h3 className="font-bold text-white text-sm mb-1">Express Dispatch &amp; Delivery</h3>
              <p className="text-xs text-slate-400">Your surprise gift box is packed and delivered directly to your doorstep!</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
