import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Gift, Check, Palette, Heart, Calendar, User, MessageSquare, ShieldAlert, ShoppingBag } from 'lucide-react';
import API from '../services/api';
import { LiveBoxPreview } from '../components/customization/LiveBoxPreview';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_PRODUCTS } from '../utils/defaultProducts';

export const CustomizeBox = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(DEFAULT_PRODUCTS[0]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [recipientName, setRecipientName] = useState('Rahul');
  const [birthdayDate, setBirthdayDate] = useState('2026-08-25');
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('Male');
  const [favoriteColor, setFavoriteColor] = useState('Purple');
  const [theme, setTheme] = useState(searchParams.get('theme') || 'Anime');
  const [personalMessage, setPersonalMessage] = useState('Happy Birthday Rahul! Have an amazing year ahead!');
  const [giftPreferences, setGiftPreferences] = useState('Loves action collectibles & chocolates');
  const [thingsToAvoid, setThingsToAvoid] = useState('No nuts or peanuts');
  const [photoUrl, setPhotoUrl] = useState('');
  const [quantity, setQuantity] = useState(1);

  const favoriteColors = ['Pink', 'Purple', 'Blue', 'Black', 'Red', 'Green', 'Yellow', 'Custom'];
  const themesList = [
    'Marvel', 'WWE', 'Anime', 'BGMI', 'Hot Wheels', 'Shinchan',
    'Barbie', 'Gaming', 'Football', 'Cute', 'Luxury', 'Custom'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        const list = Array.isArray(data) && data.length > 0 ? data : DEFAULT_PRODUCTS;
        setProducts(list);
        if (productId && productId !== 'default') {
          const found = list.find((p) => p._id === productId || p.price === Number(productId));
          if (found) setSelectedProduct(found);
          else setSelectedProduct(list[0]);
        } else {
          setSelectedProduct(list[0]);
        }
      } catch (err) {
        console.error('CustomizeBox fetch error, using default products fallback:', err);
        setProducts(DEFAULT_PRODUCTS);
        const found = DEFAULT_PRODUCTS.find((p) => p._id === productId || p.price === Number(productId)) || DEFAULT_PRODUCTS[0];
        setSelectedProduct(found);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productId]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!recipientName) {
      addToast("Please enter the birthday person's name", 'error');
      return;
    }

    const customizationObj = {
      recipientName,
      birthdayDate,
      age: Number(age),
      gender,
      favoriteColor,
      theme,
      personalMessage,
      giftPreferences,
      thingsToAvoid,
      photoUrl,
      quantity
    };

    await addToCart(selectedProduct, customizationObj, quantity);
    navigate('/cart');
  };

  const productList = Array.isArray(products) && products.length > 0 ? products : DEFAULT_PRODUCTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-black text-pink-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Customization Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
          Customize Your Mystery Box
        </h1>
        <p className="text-slate-400 text-sm">
          Tailor every detail for an unforgettable birthday surprise! Watch your box preview update in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Live Interactive Box Preview Sticky Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30">
            <LiveBoxPreview
              recipientName={recipientName}
              birthdayDate={birthdayDate}
              age={age}
              favoriteColor={favoriteColor}
              theme={theme}
              personalMessage={personalMessage}
              boxName={selectedProduct?.name || 'Standard Birthday Box'}
            />

            {/* Box Tier Selector */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Select Mystery Box Budget Tier:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {productList.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedProduct?._id === p._id
                        ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="block text-xs font-bold truncate">{p.name ? p.name.split(' ')[0] : 'Box'}</span>
                    <span className="block text-sm font-black text-pink-400 mt-0.5">₹{p.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customization Options Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleAddToCart} className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6">
            
            {/* Step 1: Recipient Basics */}
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-pink-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Birthday Person's Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient's Name *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Birthday Date *</label>
                  <input
                    type="date"
                    required
                    value={birthdayDate}
                    onChange={(e) => setBirthdayDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age Turning</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Gender / Type</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Kid Boy">Kid Boy</option>
                    <option value="Kid Girl">Kid Girl</option>
                    <option value="Unspecified">Unspecified / Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Colors & Themes */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" /> 2. Pick Theme & Favorite Color
              </h3>

              {/* Color Grid */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Favorite Color:</label>
                <div className="flex flex-wrap gap-2">
                  {favoriteColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFavoriteColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        favoriteColor === col
                          ? 'bg-purple-600 text-white border-pink-400 shadow-md ring-2 ring-pink-500/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Theme:</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {themesList.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        theme === t
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-300 shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Birthday Message & Preferences */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> 3. Personal Message & Preferences
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Birthday Message (Printed inside box card)</label>
                <textarea
                  rows="3"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday Rahul! Have an amazing year ahead!"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gift Preferences / Likes</label>
                  <input
                    type="text"
                    value={giftPreferences}
                    onChange={(e) => setGiftPreferences(e.target.value)}
                    placeholder="e.g. Loves anime keychains, dark chocolates"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Things to Avoid (Allergies, dislike)</label>
                  <input
                    type="text"
                    value={thingsToAvoid}
                    onChange={(e) => setThingsToAvoid(e.target.value)}
                    placeholder="e.g. No nut chocolates, no pink items"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Photo URL for Framed Keepsake (Optional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Cloudinary image link"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quantity & Submit */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-300">Quantity:</label>
                <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-white font-bold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-pink-500/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Add Customized Box to Cart (₹{(selectedProduct?.price || 499) * quantity})
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
