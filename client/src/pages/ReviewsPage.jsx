import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, Sparkles } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get('/reviews');
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!comment) return;
    try {
      // Pick first product as target review item
      const prods = await API.get('/products');
      const targetProdId = prods.data[0]?._id;

      await API.post('/reviews', {
        productId: targetProdId,
        rating,
        comment
      });
      addToast('Thank you! Your verified review was published.');
      setShowAddModal(false);
      setComment('');
      // Refresh list
      const { data } = await API.get('/reviews');
      setReviews(data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting review', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">
            Verified Unboxing Experiences
          </span>
          <h1 className="text-3xl font-black text-white font-display">Customer Birthday Reviews</h1>
        </div>

        {user && (
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <MessageSquarePlus className="w-4 h-4" /> Write a Review
          </button>
        )}
      </div>

      {showAddModal && (
        <form onSubmit={handleAddReview} className="glass-panel p-6 rounded-3xl border border-pink-500/30 space-y-4 max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-white uppercase">Share Your Birthday Surprise Review</h3>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Rating (1 to 5 Stars)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            >
              <option value="5">5 ★ - Outstanding Birthday Surprise!</option>
              <option value="4">4 ★ - Great Experience</option>
              <option value="3">3 ★ - Good</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Your Review Comment</label>
            <textarea
              required
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the unboxing reaction..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
            Submit Verified Review
          </button>
        </form>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">No reviews published yet. Be the first to review!</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">{rev.user?.name || 'Happy Customer'}</span>
                <span className="text-[10px]">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
