import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Palette, Warehouse, Tag, Star, Award, Settings, Shield, Bell, LogOut, CreditCard, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminSidebar = () => {
  const location = useLocation();
  const { admin, logoutAdmin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Payment Verification', path: '/admin/payments', icon: CreditCard },
    { name: 'Products & Boxes', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Inventory Stock', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Lucky Rewards', path: '/admin/rewards', icon: Award },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Payment & Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden w-full bg-[#140f24] border-b border-purple-500/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Shield className="w-5 h-5" />
          </div>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-white text-sm tracking-wider">ADMIN CONTROL</h3>
                <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-widest">DD MYSTERY BOX</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
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

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <img
              src={admin?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt="Admin Avatar"
              className="w-8 h-8 rounded-lg object-cover border border-purple-500/40"
            />
            <div className="truncate">
              <span className="block font-bold text-white text-xs truncate">{admin?.name || 'Administrator'}</span>
              <span className="block text-[10px] text-pink-400 font-semibold truncate">Role: Admin</span>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </aside>
    </>
  );
};
