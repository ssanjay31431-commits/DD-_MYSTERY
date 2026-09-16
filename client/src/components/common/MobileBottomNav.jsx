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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0a17]/95 backdrop-blur-2xl border-t border-purple-500/20 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] px-2 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-pink-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-bold'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg shadow-pink-500/50" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 text-pink-400' : 'text-slate-400'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[9px] flex items-center justify-center shadow-md shadow-pink-500/50">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] uppercase tracking-wider mt-1 leading-none ${active ? 'text-pink-300 font-black' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
