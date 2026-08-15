import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Gift, ArrowRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLogin(credentialResponse.credential);
      navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleError = () => {
    setShowConfigModal(true);
    addToast('Google Client ID configuration required (Error 401)', 'info');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 text-center space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-500/30">
            <Gift className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 block">
            DD MYSTERY BOX
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Welcome Back! 🎁
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your surprise boxes, saved addresses, and lucky rewards.
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-pink-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'LOGIN'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#18132a] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              ────── OR ──────
            </span>
          </div>
        </div>

        {/* Continue with Google */}
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            size="large"
          />
        </div>

        <div className="pt-2 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${redirect}`} className="font-bold text-pink-400 hover:underline">
            Create Account
          </Link>
        </div>

      </div>

      {/* Google OAuth Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 max-w-lg w-full space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Google OAuth Setup (Error 401)</h3>
                <p className="text-xs text-slate-400">Why Google Sign-In requires your Client ID:</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>Google blocks authentication (Error 401: invalid_client) until your domain/localhost is authorized in your Google Cloud Console.</p>
              <div className="font-semibold text-amber-300 pt-1">How to enable Google Login in 2 minutes:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-pink-400 underline">Google Cloud Console</a>.</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).</li>
                <li>Add Authorized JS origin: <code className="bg-slate-900 px-1 py-0.5 rounded text-pink-300">http://localhost:5173</code></li>
                <li>Copy your Client ID and paste it into <code className="bg-slate-900 px-1 py-0.5 rounded text-pink-300">client/.env</code> as <code className="bg-slate-900 px-1 py-0.5 rounded text-pink-300">VITE_GOOGLE_CLIENT_ID</code>.</li>
              </ol>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-slate-400">Or use email/password login above!</span>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
