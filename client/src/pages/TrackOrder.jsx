import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, Calendar, MapPin, Sparkles } from 'lucide-react';
import API from '../services/api';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { EmptyState } from '../components/common/EmptyState';

export const TrackOrder = () => {
  const { orderId: urlOrderId } = useParams();
  const [orderIdInput, setOrderIdInput] = useState(urlOrderId || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTracking = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await API.get(`/orders/tracking/${idToSearch}`);
      setTrackingData(data);
    } catch (err) {
      console.error(err);
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderId) {
      fetchTracking(urlOrderId);
    }
  }, [urlOrderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderIdInput) return;
    fetchTracking(orderIdInput.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black text-pink-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Real-time Tracking
        </span>
        <h1 className="text-3xl font-black text-white font-display">Track Your Birthday Mystery Box</h1>
        <p className="text-slate-400 text-sm">
          Enter your Order ID (e.g. DDMB-2026-00001) to view real-time preparation and shipping progress.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter Order ID (DDMB-2026-XXXXX)"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-white placeholder-slate-500 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase"
        >
          Track
        </button>
      </form>

      {/* Tracking Results */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Fetching order tracking information...</div>
      ) : searched && !trackingData ? (
        <EmptyState
          title="Order Not Found"
          description="We couldn't find an order matching that ID. Please verify your order reference number."
          icon={Package}
        />
      ) : trackingData ? (
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-8 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Tracking Order Reference</span>
              <h2 className="text-2xl font-black text-white font-display">{trackingData.orderId}</h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase block">Current Status</span>
              <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-xs uppercase border border-pink-500/30 mt-0.5">
                {trackingData.currentStatus}
              </span>
            </div>
          </div>

          {/* Timeline Component */}
          <OrderTimeline currentStatus={trackingData.currentStatus} trackingHistory={trackingData.trackingHistory} />

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-pink-400" /> Delivery Address
              </h4>
              <p className="text-xs text-slate-300">
                {trackingData.deliveryAddressSnapshot?.fullName}<br />
                {trackingData.deliveryAddressSnapshot?.houseNo}, {trackingData.deliveryAddressSnapshot?.street}, {trackingData.deliveryAddressSnapshot?.area}<br />
                {trackingData.deliveryAddressSnapshot?.city}, {trackingData.deliveryAddressSnapshot?.state} - {trackingData.deliveryAddressSnapshot?.pincode}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Expected Delivery
              </h4>
              <p className="text-sm font-bold text-emerald-400">
                {trackingData.expectedDeliveryDate ? new Date(trackingData.expectedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }) : '3-5 Business Days'}
              </p>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
