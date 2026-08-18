import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Check, Gift, Heart, Star, ArrowLeft, ShoppingBag, Zap, Award, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_PRODUCTS } from '../utils/defaultProducts';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const findFallbackProduct = (paramId) => {
    if (!paramId) return DEFAULT_PRODUCTS[0];
    const found = DEFAULT_PRODUCTS.find(
      (p) => p._id === paramId || String(p.price) === String(paramId) || p.name.toLowerCase().includes(String(paramId).toLowerCase())
    );
    return found || DEFAULT_PRODUCTS[0];
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        const isValid = data && data._id && data.name && data.price !== undefined && !data.message;
        if (isValid) {
          setProduct(data);
        } else {
          setProduct(findFallbackProduct(id));
        }
      } catch (err) {
        console.error('Product details fetch error, using fallback:', err);
        setProduct(findFallbackProduct(id));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const targetProduct = product || findFallbackProduct(id);
    const customizationDefault = {
      recipientName: 'Birthday Star',
      birthdayDate: '2026-08-25',
      favoriteColor: targetProduct?.price === 499 ? 'Purple' : 'Pink',
      theme: targetProduct?.price === 499 ? 'Nostalgia' : 'Choco Party',
      personalMessage: `Happy Birthday! Enjoy your ${targetProduct?.name} surprise!`
    };
    await addToCart(targetProduct, customizationDefault, quantity);
  };

  const handleBuyNow = async () => {
    const targetProduct = product || findFallbackProduct(id);
    const customizationDefault = {
      recipientName: 'Birthday Star',
      birthdayDate: new Date().toISOString().split('T')[0],
      favoriteColor: targetProduct?.price === 499 ? 'Purple' : 'Pink',
      theme: targetProduct?.price === 499 ? 'Nostalgia' : 'Choco Party',
      personalMessage: `Happy Birthday! Enjoy your ${targetProduct?.name} surprise!`
    };
    const buyNowItem = {
      _id: `buynow_${Date.now()}`,
      product: targetProduct,
      customization: customizationDefault,
      quantity: quantity,
      unitPrice: targetProduct.price || 499
    };
    sessionStorage.setItem('dd_buynow_item', JSON.stringify(buyNowItem));
    navigate('/checkout', { state: { isBuyNow: true } });
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-8"><CardSkeleton /></div>;
  }

  const currentProduct = product && product.name ? product : findFallbackProduct(id);
  const isWishlisted = isInWishlist(currentProduct._id);
  const contents = currentProduct.contents || [];
  const price = currentProduct.price || 499;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to All Mystery Boxes
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 glass-panel p-8 rounded-3xl border border-purple-500/20">
        
        {/* Left Column: Product Image & Highlights */}
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-square flex items-center justify-center border-2 border-purple-500/30 shadow-2xl">
            <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-full object-cover rounded-3xl" />
            
            {currentProduct.tag && (
              <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-500/30">
                {currentProduct.tag}
              </span>
            )}

            <button
              onClick={() => toggleWishlist(currentProduct._id)}
              className="absolute top-4 right-4 p-3 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-pink-400"
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-pink-500 fill-pink-500' : ''}`} />
            </button>
          </div>

          {/* Highlights Checklist */}
          {currentProduct.highlights && currentProduct.highlights.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Quality & Guarantee Highlights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {currentProduct.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details & Complete "What's Inside?" Breakdown */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-1 text-sm font-bold">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span>{currentProduct.rating || 4.9} / 5.0</span>
              <span className="text-slate-400 font-normal">({currentProduct.numReviews || 128} reviews)</span>
            </div>

            <h1 className="text-3xl font-black text-white font-display leading-tight">{currentProduct.name}</h1>
            {currentProduct.tagline && (
              <p className="text-sm font-bold text-pink-400 italic mt-1">"{currentProduct.tagline}"</p>
            )}

            <div className="flex items-center gap-4 mt-3 pb-4 border-b border-slate-800">
              <span className="text-4xl font-black text-white font-display">₹{price}</span>
              {currentProduct.originalPrice && (
                <span className="text-lg text-slate-400 line-through">₹{currentProduct.originalPrice}</span>
              )}
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                Full Online Payment
              </span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-4">
              {currentProduct.description}
            </p>

            {/* Special MrBeast Surprise callout banner for Choco Box */}
            {price === 199 && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-pink-500/20 border border-amber-500/40 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-400 animate-bounce shrink-0" />
                <div>
                  <h4 className="font-extrabold text-amber-300 text-xs uppercase">Special Surprise Feature!</h4>
                  <p className="text-xs text-white font-bold">Chance to Get MrBeast Chocolate inside your box!</p>
                  <p className="text-[10px] text-slate-400 italic">Dispatched as a random surprise reward item in select boxes.</p>
                </div>
              </div>
            )}

            {/* Complete "What's Inside?" Section */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/90 border-2 border-pink-500/30 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300 font-display uppercase flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-400" /> Complete Box Contents ("What's Inside?")
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                  {contents.length} Items Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 max-h-60 overflow-y-auto pr-1">
                {contents.map((item, idx) => {
                  const isObj = typeof item === 'object' && item !== null;
                  const name = isObj ? item.name : item;
                  const img = isObj ? item.image : '';
                  const desc = isObj ? item.description : '';
                  const isMystery = isObj ? item.isMystery : false;

                  return (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      {img ? (
                        <img src={img} alt={name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-purple-500/30" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-white block text-xs truncate">{name}</span>
                        {desc && <span className="text-[10px] text-slate-400 block truncate">{desc}</span>}
                      </div>
                      {isMystery && (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold shrink-0">
                          🎁 Mystery
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quantity & Action Buttons (Add to Cart & Buy Now) */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-300">Quantity:</label>
                <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-white font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <Link
                to={`/customize/${currentProduct._id}`}
                className="text-xs font-bold text-purple-400 hover:text-pink-400 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Customize Details →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-2xl bg-slate-900 border border-purple-500/40 text-slate-200 hover:text-white hover:border-purple-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" /> Add To Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-pink-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now (₹{price * quantity})
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
