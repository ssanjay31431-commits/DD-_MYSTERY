import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Edit3, ArrowRight, Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/EmptyState';
import API from '../services/api';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, couponApplied, applyCoupon, subtotal, deliveryFee, totalAmount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [settings, setSettings] = useState({ codAdvanceType: 'percentage', codAdvanceValue: 20 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    applyCoupon(couponInput);
  };

  let advanceRequired = 0;
  if (settings.codAdvanceType === 'percentage') {
    advanceRequired = Math.round((totalAmount * (settings.codAdvanceValue / 100)) * 100) / 100;
  } else {
    advanceRequired = Math.min(totalAmount, settings.codAdvanceValue);
  }
  const remainingBalance = Math.round((totalAmount - advanceRequired) * 100) / 100;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Shopping Cart is Empty"
          description="You haven't added any mystery boxes to your cart yet!"
          icon={ShoppingBag}
          actionText="Explore Mystery Boxes"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-display">Your Cart</h1>
          <p className="text-xs text-slate-400">Review your selected mystery boxes before proceeding to checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const product = item.product || {};
            const customization = item.customization || {};

            return (
              <div key={item._id} className="glass-panel p-6 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                
                <div className="flex items-center gap-4">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80'}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{product.name || 'Mystery Box'}</h3>
                    <p className="text-xs text-pink-400 font-semibold">
                      For: {customization.recipientName || 'Recipient'} • Theme: {customization.theme || 'Nostalgia'}
                    </p>

                    {product.contents && product.contents.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        Includes: {product.contents.slice(0, 3).join(', ')}...
                      </p>
                    )}

                    <Link
                      to={`/product/${product._id || 'default'}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-pink-400 mt-2"
                    >
                      <Edit3 className="w-3 h-3" /> View Box Details
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-white font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block text-lg font-black text-white font-display">
                      ₹{(item.unitPrice || product.price || 0) * item.quantity}
                    </span>
                    <span className="text-[10px] text-slate-500">₹{item.unitPrice || product.price} each</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <Link to="/shop" className="text-xs font-bold text-slate-400 hover:text-white">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6">
            <h3 className="text-lg font-bold text-white font-display border-b border-slate-800 pb-4">
              Order Summary
            </h3>

            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-pink-400" /> Apply Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FIRSTORDER10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase"
                >
                  Apply
                </button>
              </div>

              {couponApplied.code && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                  <Sparkles className="w-3.5 h-3.5" /> Coupon '{couponApplied.code}' Applied! (-₹{couponApplied.discountAmount})
                </p>
              )}
            </form>

            <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-400">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              {couponApplied.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponApplied.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-3">
                <span>Total Order Value</span>
                <span className="text-white">₹{totalAmount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-2 mt-4">
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Flexible Online Payment
                </span>
                
                <div className="flex justify-between text-xs text-amber-300 font-bold">
                  <span>Advance Payment (Online):</span>
                  <span>₹{advanceRequired}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-300">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-white">₹{remainingBalance}</span>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1">
                  Pay ₹{advanceRequired} online now to confirm your order, or choose Full Online Payment at checkout.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-pink-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
