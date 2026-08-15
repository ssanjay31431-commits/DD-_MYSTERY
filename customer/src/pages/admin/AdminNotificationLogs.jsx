import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, Search, Filter } from 'lucide-react';
import API from '../../services/api';

export const AdminNotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/notifications/logs');
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching notification logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesChannel = filterChannel === 'ALL' || log.channel?.toUpperCase() === filterChannel;
    const matchesSearch = !searchQuery || 
      log.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Notification Message Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit history of all automated & manual Brevo emails and SMS notifications sent to customers.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2 w-full sm:w-auto">
          {['ALL', 'EMAIL', 'SMS'].map(channel => (
            <button
              key={channel}
              onClick={() => setFilterChannel(channel)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterChannel === channel
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {channel === 'ALL' ? 'All Channels' : channel === 'EMAIL' ? '📧 Brevo Email' : '📱 SMS'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Order ID, recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Type / Event</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">Loading notification logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">No notification logs recorded yet.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-pink-400">{log.orderId}</td>
                    <td className="p-4 font-bold text-white">{log.customerName}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.channel === 'Email' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                      }`}>
                        {log.channel === 'Email' ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{log.type}</td>
                    <td className="p-4 font-mono text-slate-400">{log.recipient}</td>
                    <td className="p-4 text-slate-400">{log.provider || 'Brevo'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Sent' || log.status === 'Delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}>
                        {log.status === 'Sent' || log.status === 'Delivered' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {new Date(log.sentAt || log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
