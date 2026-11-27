import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Eye, Zap } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { OptimizedImage } from '../common/OptimizedImage';
import { safeSetSessionItem, sanitizeProduct } from '../../utils/storage';
import { productAccent } from '../../hooks/useGlassFx';

const diwaliCampaignStartsAt = Date.parse('2026-10-29T00:00:00+05:30');
const diwaliCampaignEndsAt = Date.parse('2026-11-09T00:00:00+05:30');

export const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(product._id);
  const isDiwaliEdition =
    /diwali/i.test([product.name, product.tagline, product.tag].filter(Boolean).join(' ')) &&
    Date.now() >= diwaliCampaignStartsAt &&
    Date.now() < diwaliCampaignEndsAt;
  const accent = isDiwaliEdition ? '255, 160, 60' : productAccent(product);

  const contentsCount = product.contents?.length || (product.price === 499 ? 16 : 5);
  const contentsLabel = product.price === 499 ? `${contentsCount}+ Nostalgia Items` : `${contentsCount} Surprise Gifts`;

  const handleBuyNow = (e) => {
    e.preventDefault();
    const buyNowItem = {
      _id: `buynow_${Date.now()}`,
      product: sanitizeProduct(product),
      customization: {
        recipientName: 'Birthday Star',
        birthdayDate: new Date().toISOString().split('T')[0],
        favoriteColor: product.price === 499 ? 'Purple' : 'Pink',
        theme: product.price === 499 ? 'Nostalgia' : 'Choco Party',
        personalMessage: `Happy Birthday! Enjoy your ${product.name} surprise!`
      },
      quantity: 1,
      unitPrice: product.price || 499
    };
    safeSetSessionItem('dd_buynow_item', buyNowItem);
    navigate('/checkout', { state: { isBuyNow: true } });
  };

  return (
    <div
      style={{ '--accent-rgb': accent }}
      className="group glass-2 glass-glow glass-lift glass-sheen rounded-[28px] p-4 sm:p-5 flex flex-col justify-between w-full"
    >
      {/* Accent glow bleeding in from the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[85%] h-56 rounded-full opacity-50 transition-opacity duration-700 group-hover:opacity-80"
        style={{ background: `radial-gradient(closest-side, rgba(${accent}, 0.55), transparent)` }}
      />
      {isDiwaliEdition && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-300 to-orange-500" />
      )}

      {/* Product Tag / Badge */}
      {(product.tag || isDiwaliEdition) && (
        <span
          className="pill absolute top-7 left-7 z-10 px-3 py-1 text-white font-bold text-[10px] tracking-wider uppercase"
          style={{
            background: `linear-gradient(135deg, rgba(${accent}, 0.95), rgba(${accent}, 0.6))`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px -4px rgba(${accent}, 0.9)`
          }}
        >
          {isDiwaliEdition ? 'Diwali Edition' : product.tag}
        </span>
      )}

      {/* Wishlist Toggle Button */}
      <button
        onClick={() => toggleWishlist(product._id)}
        className="glass-round absolute top-6 right-6 z-10 w-9 h-9 bg-[rgba(6,11,31,0.45)]"
        title="Save to Wishlist"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={isWishlisted}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#FF4FA3] fill-[#FF4FA3]' : ''}`} />
      </button>

      {/* Product Visual Image */}
      <div className={`relative w-full aspect-square rounded-[18px] overflow-hidden mb-5 bg-white/[0.03] ring-1 ring-white/10 flex items-center justify-center ${
        isDiwaliEdition ? 'ring-2 ring-amber-300/70' : ''
      }`}>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full object-cover rounded-[18px] transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a26]/85 via-transparent to-transparent" />

        {/* Contents Pill Overlay */}
        <div className="pill glass-1 absolute bottom-3 left-3 px-3 py-1 text-white text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#FFB84D]" />
          <span>{contentsLabel}</span>
        </div>
      </div>

      {isDiwaliEdition && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-gradient-to-r from-rose-950/70 via-amber-950/60 to-orange-950/70 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <span>Festive surprise · Diwali week edition</span>
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
        </div>
      )}

      {/* Product Header & Description */}
      <div className="relative">
        <h3 className="text-xl font-bold font-display tracking-[-0.02em] mb-1 text-white">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-xs font-semibold mb-2 italic" style={{ color: `rgb(${accent})` }}>
            "{product.tagline}"
          </p>
        )}
        <p className="text-sm text-white/60 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* What's Inside Preview Items */}
        {product.contents && product.contents.length > 0 && (
          <div className="mb-5 p-3 rounded-[14px] bg-white/[0.03] ring-1 ring-white/[0.07]">
            <span className="text-[10px] font-semibold text-white/45 uppercase tracking-wider block mb-2">What's Inside Preview:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.contents.slice(0, 4).map((item, idx) => {
                const itemName = typeof item === 'object' ? item.name : item;
                return (
                  <span key={idx} className="chip px-2 py-0.5 text-white/75 text-[10px] font-medium">
                    ✓ {itemName}
                  </span>
                );
              })}
              {product.contents.length > 4 && (
                <span className="chip px-2 py-0.5 text-[10px] font-semibold" style={{ color: `rgb(${accent})` }}>
                  +{product.contents.length - 4} More Items
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Call-to-action */}
      <div className="relative pt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-white font-display tracking-[-0.02em]">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-white/35 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="pill text-[10px] font-semibold text-emerald-300 bg-emerald-400/10 ring-1 ring-emerald-300/20 px-2.5 py-0.5">
            Full Online Payment
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleBuyNow}
            className="btn btn-accent w-full h-11 px-3 text-xs uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 fill-white" /> Buy Now (₹{product.price})
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/product/${product._id}`}
              className="btn btn-glass btn-flat w-full h-10 px-2 text-xs font-semibold"
            >
              <Eye className="w-3.5 h-3.5" /> Details
            </Link>

            <Link
              to={`/customize/${product._id}`}
              className="btn btn-glass btn-flat w-full h-10 px-2 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: `rgb(${accent})` }} /> Customize
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
