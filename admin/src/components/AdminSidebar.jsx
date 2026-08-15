import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Palette, Warehouse, Tag, Star, Award, Settings, Shield, Bell, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminSidebar = () => {
  const location = useLocation();
  const { admin, logoutAdmin } = useAdminAuth();

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products & Boxes', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Inventory Stock', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Lucky Rewards', path: '/admin/rewards', icon: Award },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'COD & Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#140f24] border-r border-purple-500/20 p-4 min-h-screen flex flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div>
        <div className="flex items-center gap-3 p-3 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-sm tracking-wider">ADMIN CONTROL</h3>
            <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-widest">DD MYSTERY BOX</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
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
  );
};
