import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id);

  const contentsCount = product.contents?.length || (product.price === 499 ? 16 : 5);
  const contentsLabel = product.price === 499 ? `${contentsCount}+ Nostalgia Items` : `${contentsCount} Surprise Gifts`;

  return (
    <div className="group relative glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between overflow-hidden border border-purple-500/20">
      
      {/* Product Tag / Badge */}
      {product.tag && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-lg shadow-pink-500/30">
          {product.tag}
        </span>
      )}

      {/* Wishlist Toggle Button */}
      <button
        onClick={() => toggleWishlist(product._id)}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-pink-400 hover:scale-110 transition-all"
        title="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'text-pink-500 fill-pink-500' : ''}`} />
      </button>

      {/* Product Visual Image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5 bg-slate-900 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-2xl group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18132a] via-transparent to-transparent opacity-80" />

        {/* Contents Pill Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-lg border border-pink-500/40 text-pink-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{contentsLabel}</span>
        </div>
      </div>

      {/* Product Header & Description */}
      <div>
        <h3 className="text-xl font-black font-display text-white tracking-wide mb-1 group-hover:text-pink-400 transition-colors">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-xs font-bold text-amber-300 mb-2 italic">
            "{product.tagline}"
          </p>
        )}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* What's Inside Preview Items */}
        {product.contents && product.contents.length > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-purple-500/20">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">What's Inside Preview:</span>
            <div className="flex flex-wrap gap-1">
              {product.contents.slice(0, 4).map((item, idx) => {
                const itemName = typeof item === 'object' ? item.name : item;
                return (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-200 text-[10px] font-semibold border border-purple-500/20">
                    ✓ {itemName}
                  </span>
                );
              })}
              {product.contents.length > 4 && (
                <span className="px-2 py-0.5 rounded-md bg-pink-950/60 text-pink-300 text-[10px] font-bold">
                  +{product.contents.length - 4} More Items
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Call-to-action */}
      <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-white font-display">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            Advance + COD Eligible
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/product/${product._id}`}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 text-center flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Eye className="w-4 h-4" /> View Details
          </Link>

          <Link
            to={`/customize/${product._id}`}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 hover:text-white hover:border-purple-500 font-bold text-xs text-center flex items-center justify-center transition-all"
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
};
