import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('ddmarket130@gmail.com');
  const [password, setPassword] = useState('ddmarket468');
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a17] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 text-center space-y-6">
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/20">
            <Shield className="w-9 h-9" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 block">
            DD MYSTERY BOX
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Admin Control Center 🛡️
          </h1>
          <p className="text-xs text-slate-400">
            Enter administrative credentials to manage mystery boxes, orders, and business settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating Admin...' : 'LOGIN TO ADMIN CONTROL'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-left text-[11px] text-slate-300">
          <span className="font-bold text-amber-300 block mb-1">🔑 Default Admin Credentials:</span>
          <p className="font-mono text-[10px]">Email: ddmarket130@gmail.com</p>
          <p className="font-mono text-[10px]">Password: ddmarket468</p>
        </div>

      </div>
    </div>
  );
};
