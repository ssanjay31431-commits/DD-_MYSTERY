import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Star, ArrowRight, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useMagnetic, useTilt } from '../hooks/useGlassFx';

const CRIMSON = '225, 29, 72';

const occasions = [
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
];

const steps = [
  { title: 'Select & Customize Box', body: 'Pick your favorite mystery box tier or customize birthday details in seconds.', accent: '124, 92, 255' },
  { title: 'Instant Full Online Payment', body: 'Complete 100% full online payment for your item safely at checkout.', accent: '61, 217, 255' },
  { title: 'Express Dispatch & Delivery', body: 'Your surprise gift box is packed and delivered directly to your doorstep!', accent: '255, 79, 163' }
];

const MarvelCard = ({ product, savings }) => {
  const cardRef = useRef(null);
  useTilt(cardRef, { max: 8 });

  return (
    <Link
      ref={cardRef}
      to={`/product/${product._id}`}
      style={{ '--accent-rgb': CRIMSON }}
      className="group tilt glass-3 block rounded-[28px] p-5 pt-6 sm:p-7 mt-14 sm:mt-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
      aria-label={`${product.name}: view details and order for ₹${product.price}`}
    >
      <span className="halftone" aria-hidden="true" />
      <span className="tilt-glare" aria-hidden="true" />

      <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-4">
        {/* Product image floats out past the card's top edge */}
        <div className="sm:order-2 relative mx-auto -mt-20 sm:-mt-20 sm:-mr-10 lg:-mr-12 w-44 sm:w-48 lg:w-52 aspect-square">
          <div className="absolute inset-x-4 bottom-0 h-1/3 rounded-full bg-[rgba(225,29,72,0.55)] blur-2xl" aria-hidden="true" />
          <img
            src={`${product.image}${product.image?.includes('?') ? '&' : '?'}width=640`}
            alt={product.name}
            width="416"
            height="416"
            className="marvel-image relative h-full w-full rounded-[22px] object-cover ring-1 ring-white/20"
            onError={(e) => { e.currentTarget.src = product.image; }}
          />
        </div>

        <div className="sm:order-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill pill-live px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              New Drop
            </span>
            {savings > 0 && (
              <span className="pill pill-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Save {savings}%
              </span>
            )}
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-200/80">Limited Edition</p>
          <h2 className="marvel-title font-display text-4xl sm:text-5xl font-extrabold leading-none tracking-[-0.02em]">
            MARVEL
            <span className="block text-2xl sm:text-3xl tracking-[0.25em]">EDITION</span>
          </h2>
          <div className="mt-3 flex items-center gap-1 text-[#FFB84D] text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-[#FFB84D]" /> {product.rating || 4.9}
            <span className="text-white/45 font-normal">({product.numReviews || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Perks */}
      <ul className="relative mt-5 space-y-2 text-left">
        <li className="glass-1 edge-gold flex items-center gap-3 rounded-[18px] px-3 py-2.5">
          <span className="glass-icon w-10 h-10 text-lg" aria-hidden="true">🎟️</span>
          <span className="text-sm font-bold text-[#FFE2A8]">2 FREE Avengers: Doomsday movie tickets</span>
        </li>
        <li className="glass-1 flex items-center gap-3 rounded-[18px] px-3 py-2.5">
          <span className="glass-icon w-10 h-10 text-lg" aria-hidden="true">🦸</span>
          <span className="text-sm font-medium text-white/85">₹500+ worth of Marvel goodies inside</span>
        </li>
        <li className="glass-1 flex items-center gap-3 rounded-[18px] px-3 py-2.5">
          <span className="glass-icon w-10 h-10 text-lg" aria-hidden="true">🚚</span>
          <span className="text-sm font-medium text-white/85">
            {product.deliveryCharge === 0 ? 'Free delivery' : 'Fast delivery'} to your doorstep
          </span>
        </li>
      </ul>

      {/* Price + CTA */}
      <div className="relative mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5">
        <div className="glass-divider absolute inset-x-0 top-0 opacity-60" aria-hidden="true" />
        <div className="text-center sm:text-left">
          <div className="flex items-baseline gap-2.5">
            <span className="text-gold font-display text-5xl font-extrabold tracking-[-0.03em]">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-base font-medium text-white/35 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 50 && (
            <p className="mt-0.5 text-[11px] font-semibold text-rose-300">Only {product.stock} left!</p>
          )}
        </div>
        <span className="btn btn-gold w-full sm:w-auto px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide">
          Grab It Now <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
};

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
  const exploreRef = useRef(null);
  useMagnetic(exploreRef);

  return (
    <div className="space-y-24 pb-16">

      {/* Hero Section */}
      <section className="relative w-full max-w-full pt-8 pb-12 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">

            {/* Left Content */}
            <div className="text-center lg:text-left space-y-7">

              {/* Logo medallion + badge */}
              <div data-reveal className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                <div className="medallion shrink-0 group">
                  <div className="medallion-ring w-24 h-24 sm:w-28 sm:h-28 p-2">
                    <img
                      src="/logo.png"
                      alt="DD Mystery Box Official Logo"
                      width="112"
                      height="112"
                      className="w-full h-full object-contain rounded-full transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="pill pill-aurora px-4 py-1.5 text-white/90 text-xs font-semibold tracking-wide max-w-full">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#3DD9FF]" aria-hidden="true" />
                  <span className="truncate">The Surprise Box for Every Moment</span>
                </div>
              </div>

              {/* Main Hero Heading */}
              <h1 data-reveal style={{ '--reveal-delay': '80ms' }} className="font-display font-extrabold text-white leading-[0.95] tracking-[-0.03em] text-[2.25rem] sm:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
                <span className="text-shimmer">DD MYSTERY BOX</span>
                <span className="block mt-5 font-accent italic font-normal tracking-normal leading-[1.1] text-aurora text-[1.75rem] sm:text-4xl lg:text-[2.6rem]">
                  "Not Just a Gift.
                  <br className="hidden sm:inline" /> A Mystery Waiting to Be Yours!"
                </span>
              </h1>

              {/* Description */}
              <p data-reveal style={{ '--reveal-delay': '160ms' }} className="text-white/70 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                From birthdays and anniversaries to friendship, celebrations, nostalgia, thank-you moments, or simply 'just because' — choose a mystery box made to turn ordinary moments into unforgettable surprises.
              </p>

              {/* Highlight Callout */}
              <div data-reveal style={{ '--reveal-delay': '200ms' }} className="flex items-center justify-center lg:justify-start gap-2 text-sm font-semibold text-white/85 select-none">
                <span className="text-lg shrink-0" aria-hidden="true">🎁</span>
                <span>One Box. Endless Reasons to Surprise.</span>
              </div>

              {/* Action Buttons */}
              <div data-reveal style={{ '--reveal-delay': '260ms' }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  ref={exploreRef}
                  to="/shop"
                  className="btn btn-luminous magnetic w-full sm:w-auto h-[52px] px-8 text-sm tracking-wide"
                >
                  <Gift className="w-4 h-4" /> <span>Explore Mystery Boxes</span>
                </Link>

                <Link
                  to={nostalgiaBox ? `/customize/${nostalgiaBox._id}` : '/shop'}
                  className="btn btn-glass glass-sheen w-full sm:w-auto h-[52px] px-8 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#3DD9FF]" /> <span>Customize Surprise</span>
                </Link>
              </div>

              {/* Occasion Tags List */}
              <div data-reveal style={{ '--reveal-delay': '320ms' }}>
                <p className="eyebrow mb-3">Surprise Someone For:</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  {occasions.map((occasion) => (
                    <span key={occasion} className="chip px-3 py-1.5 text-white/80 hover:text-white text-xs font-medium">
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div data-reveal style={{ '--reveal-delay': '380ms' }} className="glass-2 p-5 rounded-[18px] grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block text-2xl font-extrabold text-aurora font-display tracking-[-0.02em]">10,000+</span>
                  <span className="text-xs text-white/55">Happy Surprises</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-2xl font-extrabold text-gold font-display tracking-[-0.02em]">4.9 ★</span>
                  <span className="text-xs text-white/55">Customer Rating</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block text-2xl font-extrabold text-white font-display tracking-[-0.02em]">Full Payment</span>
                  <span className="text-xs text-white/55">100% Safe & Instant</span>
                </div>
              </div>
            </div>

            {/* Right: featured product */}
            {diwaliCampaignActive ? (
              <div style={{ '--accent-rgb': '255, 160, 60' }} className="diwali-ad glass-3 min-h-[390px] rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-between overflow-hidden">
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
                    className="btn btn-gold w-full px-6 py-3.5 text-sm font-bold tracking-wide"
                  >
                    <Gift className="h-4 w-4" /> Open Your Surprise · Order Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
            <div data-reveal style={{ '--reveal-delay': '200ms' }} className="lg:self-start lg:pt-6">
              {marvelLoading ? (
                <div
                  className="glass-3 rounded-[28px] h-[460px] mt-14 sm:mt-10 animate-pulse"
                  style={{ '--accent-rgb': CRIMSON }}
                  aria-label="Loading Marvel Edition"
                />
              ) : marvelProduct ? (
                <MarvelCard product={marvelProduct} savings={marvelSavings} />
              ) : null}
            </div>
            )}

          </div>
        </div>
      </section>

      {/* Featured Mystery Boxes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4 text-center sm:text-left">
          <div>
            <span className="eyebrow block mb-2">Featured Products</span>
            <h2 className="text-3xl sm:text-4xl font-bold ice-text font-display">
              Our Signature Mystery Boxes
            </h2>
          </div>
          <Link to="/shop" className="btn btn-glass h-10 px-5 text-xs">
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
            <button onClick={() => setReloadKey((key) => key + 1)} className="btn btn-glass mt-4 h-10 px-5 text-xs">Retry</button>
          </div>
        ) : products.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {products.map((product, idx) => (
                <div key={product._id} data-reveal style={{ '--reveal-delay': `${idx * 110}ms` }} className="flex">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div data-reveal className="mt-12 text-center">
              <Link
                to="/shop"
                className="btn btn-glass glass-sheen h-12 px-7 text-xs uppercase tracking-wider"
              >
                Browse Full Mystery Collection <ArrowRight className="w-4 h-4 text-[#3DD9FF]" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-white/50">No products are currently available.</p>
        )}
      </section>

      {/* How Ordering & Full Payment Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="glass-2 p-6 sm:p-12 rounded-[28px]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow block mb-2">Secure &amp; Fast Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold ice-text font-display">
              How Full Online Payment Works
            </h2>
            <p className="text-white/60 text-sm mt-3">
              Simple 3-step checkout. Complete full online payment securely and get fast dispatch of your mystery surprise box!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                data-reveal
                style={{ '--reveal-delay': `${idx * 110}ms` }}
              >
                <div
                  className="glass-1 glass-lift glass-sheen h-full p-6 rounded-[18px]"
                  style={{ '--accent-rgb': step.accent }}
                >
                  <span
                    className="glass-icon w-11 h-11 rounded-full font-display font-bold text-sm text-white mb-4"
                    style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 0 24px -4px rgba(${step.accent}, 0.8)`, background: `linear-gradient(135deg, rgba(${step.accent}, 0.45), rgba(${step.accent}, 0.1))` }}
                  >
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-white text-base mb-1.5">{step.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
