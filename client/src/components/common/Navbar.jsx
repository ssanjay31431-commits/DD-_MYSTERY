import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, Package, MapPin, Shield, ChevronDown, Sparkles, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const desktopLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'All Mystery Boxes' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const mobileLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'All Mystery Boxes' },
  { to: '/reviews', label: 'Customer Reviews' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/track', label: 'Track Order' },
];

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className="glow-badge absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full font-bold text-[10px] leading-none flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shrink the pill and deepen its blur once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Bottom sheet: lock page scroll and close on Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMobileMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const dropdownItem = 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/75 hover:bg-white/[0.08] hover:text-white transition-colors';

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 pointer-events-none">
      <div
        className={`nav-pill glass-1 pointer-events-auto mx-auto rounded-full flex items-center justify-between gap-2 pl-2 pr-2 sm:pl-3 sm:pr-3 ${
          scrolled ? 'is-scrolled h-14 sm:h-[60px] max-w-6xl' : 'h-16 sm:h-[72px] max-w-7xl'
        }`}
      >
        {/* Mobile menu toggle & brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="glass-round md:hidden w-10 h-10 shrink-0"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="medallion-ring w-9 h-9 sm:w-11 sm:h-11 p-[3px] shrink-0 transition-transform duration-500 ease-out-expo group-hover:scale-105">
              <img
                src="/logo.png"
                alt="DD Mystery Box Logo"
                className="w-full h-full object-contain rounded-full bg-[#060B1F]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="font-display font-extrabold text-sm sm:text-lg text-white tracking-[-0.02em] flex items-center gap-1 truncate">
                DD MYSTERY BOX <Sparkles className="w-3.5 h-3.5 text-[#FFB84D] shrink-0" />
              </span>
              <span className="text-[10px] font-medium text-white/50 tracking-wide -mt-0.5 truncate hidden sm:block">
                "Surprise Boxes for Every Moment"
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 text-[13px] font-medium">
          {desktopLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link whitespace-nowrap">
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Wishlist, cart, profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link to="/wishlist" className="glass-round w-10 h-10" title="Wishlist" aria-label={`Wishlist (${wishlistCount} items)`}>
            <Heart className="w-[18px] h-[18px]" />
            <CountBadge count={wishlistCount} />
          </Link>

          <Link to="/cart" className="glass-round w-10 h-10" title="Shopping Cart" aria-label={`Cart (${cartCount} items)`}>
            <ShoppingBag className="w-[18px] h-[18px]" />
            <CountBadge count={cartCount} />
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="glass-round h-10 gap-1.5 p-1 sm:pr-3"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <span className="avatar-ring w-8 h-8 shrink-0">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C5CFF&color=fff`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-[#14103A]"
                  />
                </span>
                <span className="font-semibold text-xs max-w-[70px] sm:max-w-[100px] truncate text-white hidden xs:inline">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 hidden sm:block transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 glass-panel rounded-[18px] p-2 z-50 space-y-0.5" role="menu">
                  <div className="p-3 mb-1 border-b border-white/10">
                    <span className="block font-semibold text-white text-xs truncate">{user.name}</span>
                    <span className="block text-[11px] text-white/50 truncate">{user.email}</span>
                  </div>

                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className={dropdownItem}>
                    <User className="w-4 h-4 text-[#FF4FA3]" /> My Profile
                  </Link>
                  <Link to="/my-orders" onClick={() => setDropdownOpen(false)} className={dropdownItem}>
                    <Package className="w-4 h-4 text-[#7C5CFF]" /> My Orders
                  </Link>
                  <Link to="/saved-addresses" onClick={() => setDropdownOpen(false)} className={dropdownItem}>
                    <MapPin className="w-4 h-4 text-[#3DD9FF]" /> Saved Addresses
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#FFB84D] hover:bg-[#FFB84D]/10 transition-colors"
                    >
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-luminous h-10 px-4 sm:px-5 text-xs tracking-wide">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom-sheet menu, portalled so it sits above the bottom nav */}
      {mobileMenuOpen &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <button
              className="sheet-backdrop absolute inset-0 w-full h-full cursor-default"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="sheet glass-2 absolute inset-x-0 bottom-0 rounded-t-[28px] px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/25" aria-hidden="true" />
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="eyebrow">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="glass-round w-9 h-9" aria-label="Close navigation menu">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {mobileLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `glass-1 rounded-[18px] px-4 py-3.5 flex items-center justify-between text-sm font-semibold transition-colors ${
                        isActive ? 'is-current text-white' : 'text-white/75'
                      }`
                    }
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
