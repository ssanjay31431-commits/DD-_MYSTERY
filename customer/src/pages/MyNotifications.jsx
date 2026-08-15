import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Package, ShieldCheck, Mail, Check } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

export const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      addToast('Marked as read ✓');
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-purple-500/20">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-pink-400">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">My Order Notifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">Stay updated with your mystery box order status, shipment tracking & rewards.</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 rounded-3xl text-center text-slate-400">Loading your notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications Yet</h3>
          <p className="text-xs text-slate-400">When you place an order or your package updates, you will see alerts here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-purple-950/30 border-purple-500/30 text-white shadow-lg shadow-purple-950/20'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-pink-300">
                    {notif.orderId}
                  </span>
                  <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
