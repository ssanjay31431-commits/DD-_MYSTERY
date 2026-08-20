import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useToast } from '../../context/ToastContext';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const { addToast } = useToast();

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/reviews');
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/reviews/${id}/status`, { status });
      addToast(`Review marked as ${status}`);
      fetchReviews();
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Moderate Customer Reviews</h1>
            <p className="text-xs text-slate-400">Approve or reject customer reviews before they appear on the public site.</p>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="glass-panel p-6 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{rev.user?.name || 'Customer'}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    {rev.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-500">Submitted on: {new Date(rev.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatus(rev._id, 'Approved')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleStatus(rev._id, 'Rejected')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
