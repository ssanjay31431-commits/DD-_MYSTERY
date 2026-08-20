import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, Search, Filter, Send, AlertCircle } from 'lucide-react';
import API from '../services/api';

export const AdminNotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Demo Notification Testing States
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

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

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      setTestStatus({ type: 'error', message: 'Please enter a valid recipient email address' });
      return;
    }
    setSendingEmail(true);
    setTestStatus(null);
    try {
      const { data } = await API.post('/admin/test-email', { email: testEmail });
      setTestStatus({
        type: 'success',
        message: `Brevo Email sent successfully! Message ID: ${data.messageId || 'N/A'}`
      });
      fetchLogs();
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Email dispatch failed'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleTestSms = async (e) => {
    e.preventDefault();
    if (!testPhone || testPhone.length < 10) {
      setTestStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setSendingSms(true);
    setTestStatus(null);
    try {
      const { data } = await API.post('/admin/test-sms', { phone: testPhone });
      setTestStatus({
        type: 'success',
        message: `SMS dispatched! ${data.requestId ? `Request ID: ${data.requestId}` : ''}`
      });
      fetchLogs();
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: error.response?.data?.error || error.message || 'SMS dispatch failed'
      });
    } finally {
      setSendingSms(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesChannel = filterChannel === 'ALL' || log.channel?.toUpperCase() === filterChannel;
    const matchesSearch = !searchQuery || 
      log.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
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

      {/* Interactive Demo Notification Tester Card */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-slate-900/80">
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Demo Email & SMS Tester</h2>
        </div>

        {testStatus && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            testStatus.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
          }`}>
            {testStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            {testStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test Brevo Email Form */}
          <form onSubmit={handleTestEmail} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter recipient email (e.g. test@gmail.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={sendingEmail}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {sendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              Send Demo Email
            </button>
          </form>

          {/* Test SMS Form */}
          <form onSubmit={handleTestSms} className="flex gap-2">
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={sendingSms}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {sendingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
              Send Demo SMS
            </button>
          </form>
        </div>
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
                <th className="p-4">Recipient</th>
                <th className="p-4">Event / Type</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Status</th>
                <th className="p-4">Provider ID</th>
                <th className="p-4">Sent At</th>
                <th className="p-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">Loading notification logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">No notification logs recorded yet.</td>
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
                    <td className="p-4 font-mono text-slate-400">{log.recipient}</td>
                    <td className="p-4 text-slate-300 font-medium">{log.event || log.type}</td>
                    <td className="p-4 text-slate-400">{log.provider || (log.channel === 'Email' ? 'Brevo' : 'Fast2SMS')}</td>
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
                    <td className="p-4 font-mono text-[11px] text-amber-300">{log.providerMessageId || 'N/A'}</td>
                    <td className="p-4 text-slate-500 font-mono">
                      {new Date(log.sentAt || log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-rose-400 font-mono text-[11px] max-w-xs truncate" title={log.error || ''}>
                      {log.error || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  );
};
