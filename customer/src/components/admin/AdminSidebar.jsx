import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Palette, Warehouse, Tag, Star, Award, Settings, Shield, ArrowLeft, Bell } from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Boxes (Products)', path: '/admin/products', icon: Package },
    { name: 'Themes', path: '/admin/themes', icon: Palette },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Lucky Rewards', path: '/admin/rewards', icon: Award },
    { name: 'Notification Logs', path: '/admin/notifications', icon: Bell },
    { name: 'COD & Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#140f24] border-r border-purple-500/20 p-4 min-h-screen flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center gap-2 p-3 mb-6 border-b border-slate-800">
          <Shield className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="font-display font-black text-white text-sm">ADMIN DASHBOARD</h3>
            <span className="text-[10px] text-pink-400 font-bold">DD MYSTERY BOX</span>
          </div>
        </div>

        <nav className="space-y-1.5">
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

      <div className="pt-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Customer Site
        </Link>
      </div>
    </aside>
  );
};
