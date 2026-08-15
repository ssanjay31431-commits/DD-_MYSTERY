import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '637646427248-346hj45leah9i9ho215mjpok1k8jv9f2.apps.googleusercontent.com';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0c1b] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/30 max-w-md space-y-4">
            <h2 className="text-xl font-bold text-pink-400">DD MYSTERY BOX</h2>
            <p className="text-sm text-slate-300">An unexpected UI error occurred while rendering the page.</p>
            <p className="text-xs font-mono text-rose-400 p-3 rounded-xl bg-slate-950 text-left overflow-x-auto">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase hover:bg-purple-700"
            >
              Reload Website
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
