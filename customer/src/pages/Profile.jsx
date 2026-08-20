import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Clock, CheckCircle2, Heart, MapPin, Star, Shield, Edit, Save, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { wishlist } = useWishlist();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ name, phone, password: password || undefined });
    if (res.success) {
      addToast('Profile updated successfully!');
      setEditing(false);
      setPassword('');
    } else {
      addToast(res.message, 'error');
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => {
    const st = (o.orderStatus || '').toUpperCase();
    return st !== 'DELIVERED' && st !== 'CANCELLED';
  }).length;
  const deliveredOrders = orders.filter((o) => (o.orderStatus || '').toUpperCase() === 'DELIVERED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/30">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-400">Phone: {user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 hover:text-white hover:border-purple-500 font-bold text-xs flex items-center gap-2"
        >
          <Edit className="w-4 h-4" /> {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleUpdate} className="glass-panel p-6 rounded-3xl border border-pink-500/30 space-y-4 max-w-xl mx-auto animate-in fade-in">
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Update Account Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </form>
      )}

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white font-display block">{totalOrders}</span>
            <span className="text-xs text-slate-400">Total Orders</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-300 font-display block">{pendingOrders}</span>
            <span className="text-xs text-slate-400">Pending Orders</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-300 font-display block">{deliveredOrders}</span>
            <span className="text-xs text-slate-400">Delivered Orders</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-pink-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-pink-300 font-display block">{wishlist.length}</span>
            <span className="text-xs text-slate-400">Wishlist Items</span>
          </div>
        </div>
      </div>

      {/* Account Section Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/my-orders" className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-purple-400" />
            <div>
              <h4 className="font-bold text-white text-sm">My Orders</h4>
              <p className="text-xs text-slate-400">Track and view order details</p>
            </div>
          </div>
          <span className="text-xs text-pink-400 font-bold">View →</span>
        </Link>

        <Link to="/saved-addresses" className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-pink-400" />
            <div>
              <h4 className="font-bold text-white text-sm">Saved Addresses</h4>
              <p className="text-xs text-slate-400">Manage delivery locations</p>
            </div>
          </div>
          <span className="text-xs text-pink-400 font-bold">Manage →</span>
        </Link>

        <Link to="/wishlist" className="glass-panel glass-panel-hover p-6 rounded-2xl border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-amber-400" />
            <div>
              <h4 className="font-bold text-white text-sm">Wishlist</h4>
              <p className="text-xs text-slate-400">Saved birthday box items</p>
            </div>
          </div>
          <span className="text-xs text-pink-400 font-bold">View →</span>
        </Link>
      </div>

    </div>
  );
};
