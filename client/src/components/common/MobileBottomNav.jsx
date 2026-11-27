import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Star, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const pathname = location.pathname;

  const navItems = [
    {
      label: 'HOME',
      path: '/',
      icon: Home,
      exact: true
    },
    {
      label: 'BOXES',
      path: '/shop',
      icon: Package,
      match: ['/shop', '/product', '/customize']
    },
    {
      label: 'REVIEWS',
      path: '/reviews',
      icon: Star
    },
    {
      label: 'CART',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount
    },
    {
      label: 'PROFILE',
      path: user ? '/profile' : '/login',
      icon: User,
      match: ['/profile', '/my-orders', '/order', '/saved-addresses', '/login', '/register']
    }
  ];

  const isItemActive = (item) => {
    if (item.exact) {
      return pathname === '/';
    }
    if (item.match) {
      return item.match.some(p => pathname.startsWith(p));
    }
    return pathname.startsWith(item.path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="glass-1 nav-pill is-scrolled pointer-events-auto flex items-center justify-around max-w-md mx-auto h-16 rounded-full px-1.5">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 rounded-full transition-all duration-300 active:scale-95 ${
                active
                  ? 'text-white font-semibold'
                  : 'text-white/50 hover:text-white/80 font-medium'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {active && (
                <span className="absolute inset-y-1 inset-x-0.5 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" aria-hidden="true">
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3DD9FF] shadow-[0_0_10px_rgba(61,217,255,0.9)]" />
                </span>
              )}

              <div className="relative flex items-center justify-center z-[1]">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 text-white' : ''}`} />
                {item.badge > 0 && (
                  <span className="glow-badge absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-0.5 rounded-full font-bold text-[9px] flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`relative z-[1] text-[9px] uppercase tracking-wider mt-1 leading-none ${active ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
