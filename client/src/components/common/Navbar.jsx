import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, ShoppingBag, Heart, User, LogOut, Package, MapPin, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0c1b]/80 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0f0c1b] rounded-[14px] flex items-center justify-center">
              <Gift className="w-6 h-6 text-pink-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-xl text-white tracking-tight flex items-center gap-1.5">
              DD MYSTERY BOX <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block -mt-1">
              "Your Birthday. Your Theme. Your Surprise!"
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider text-slate-300">
          <Link to="/" className="hover:text-pink-400 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-pink-400 transition-colors">All Mystery Boxes</Link>
          <Link to="/reviews" className="hover:text-pink-400 transition-colors">Reviews</Link>
          <Link to="/faq" className="hover:text-pink-400 transition-colors">FAQ</Link>
          <Link to="/contact" className="hover:text-pink-400 transition-colors">Contact</Link>
        </nav>

        {/* User Utilities (Wishlist, Cart, Profile Dropdown) */}
        <div className="flex items-center gap-4">
          
          {/* Wishlist Icon Badge */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-pink-400 transition-all hover:scale-105"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-pink-500/50">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon Badge */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-slate-300 hover:text-pink-400 transition-all hover:scale-105"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-pink-500/50">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Button or User Profile Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-slate-200 hover:border-pink-500 transition-all"
              >
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-purple-500/40"
                />
                <span className="font-bold text-xs max-w-[100px] truncate text-white">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-purple-500/30 shadow-2xl z-50 space-y-1">
                  <div className="p-3 border-b border-slate-800">
                    <span className="block font-bold text-white text-xs truncate">{user.name}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-pink-400" /> My Profile
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                  >
                    <Package className="w-4 h-4 text-purple-400" /> My Orders
                  </Link>

                  <Link
                    to="/saved-addresses"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" /> Saved Addresses
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" /> Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 hover:scale-105 transition-all"
            >
              Login
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};
