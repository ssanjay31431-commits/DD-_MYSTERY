import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Palette, Warehouse, Tag, Star, Award, Settings, Shield, ArrowLeft, Bell, CreditCard, Menu, X } from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Payment Verification', path: '/admin/payments', icon: CreditCard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Boxes (Products)', path: '/admin/products', icon: Package },
    { name: 'Themes', path: '/admin/themes', icon: Palette },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Lucky Rewards', path: '/admin/rewards', icon: Award },
    { name: 'Notification Logs', path: '/admin/notifications', icon: Bell },
    { name: 'Payment & Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden w-full bg-[#140f24] border-b border-purple-500/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="font-display font-black text-white text-xs tracking-wider">ADMIN CONTROL</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-[#140f24] border-r border-purple-500/20 p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-3 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-display font-black text-white text-sm">ADMIN DASHBOARD</h3>
                <span className="text-[10px] text-pink-400 font-bold">DD MYSTERY BOX</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Customer Site
          </Link>
        </div>
      </aside>
    </>
  );
};
