import React, { useEffect, useRef, useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollerRef = useRef(null);

  const scrollReviews = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get('/reviews');
        setReviews(Array.isArray(data) ? data : []);
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
      const { data: productPage } = await API.get('/products', { params: { limit: 1 } });
      const targetProdId = (Array.isArray(productPage) ? productPage : productPage.products || [])[0]?._id;

      if (!targetProdId) {
        addToast('No products are currently available for review.', 'error');
        return;
      }

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
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting review', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">

      <div data-reveal className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="eyebrow block mb-2">
            Verified Unboxing Experiences
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-shimmer">Customer Birthday Reviews</h1>
        </div>

        <div className="flex items-center gap-2">
          {reviews.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => scrollReviews(-1)} className="glass-round w-11 h-11" aria-label="Previous reviews">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scrollReviews(1)} className="glass-round w-11 h-11" aria-label="Next reviews">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          {user && (
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="btn btn-luminous h-11 px-5 text-xs uppercase tracking-wide"
            >
              <MessageSquarePlus className="w-4 h-4" /> Write a Review
            </button>
          )}
        </div>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddReview} className="glass-2 p-6 sm:p-8 rounded-[28px] space-y-4 max-w-xl mx-auto">
          <h3 className="text-base font-semibold text-white">Share Your Birthday Surprise Review</h3>
          <div>
            <label htmlFor="review-rating" className="block text-xs text-white/60 mb-1.5">Rating (1 to 5 Stars)</label>
            <select
              id="review-rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="glass-input px-3.5 py-2.5 text-sm"
            >
              <option value="5">5 ★ - Outstanding Birthday Surprise!</option>
              <option value="4">4 ★ - Great Experience</option>
              <option value="3">3 ★ - Good</option>
            </select>
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-xs text-white/60 mb-1.5">Your Review Comment</label>
            <textarea
              id="review-comment"
              required
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the unboxing reaction..."
              className="glass-input px-3.5 py-2.5 text-sm placeholder:text-white/35"
            />
          </div>
          <button type="submit" className="btn btn-luminous h-11 px-6 text-xs uppercase tracking-wide">
            Submit Verified Review
          </button>
        </form>
      )}

      {/* Reviews: horizontal glass carousel */}
      {reviews.length === 0 ? (
        <div className="glass-1 rounded-[28px] text-center py-14 text-white/55">
          {loading ? 'Loading reviews...' : 'No reviews published yet. Be the first to review!'}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="h-scroller -mx-4 sm:-mx-6 lg:-mx-8"
          role="region"
          aria-label="Customer reviews"
          tabIndex={0}
        >
          {reviews.map((rev, idx) => {
            const name = rev.user?.name || 'Happy Customer';
            return (
              <article
                key={rev._id}
                data-reveal
                style={{ '--reveal-delay': `${Math.min(idx, 5) * 80}ms` }}
              >
                <div className="glass-2 glass-lift h-full p-6 rounded-[28px] flex flex-col justify-between gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-0.5 text-[#FFB84D]" aria-label={`${rev.rating || 5} out of 5 stars`}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFB84D]" aria-hidden="true" />
                        ))}
                      </div>
                      {rev.isVerifiedPurchase && (
                        <span className="pill text-[10px] font-semibold text-emerald-300 bg-emerald-400/10 ring-1 ring-emerald-300/20 px-2.5 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>

                    <p className="font-accent italic text-lg sm:text-xl text-white/85 leading-snug">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <span className="avatar-ring w-10 h-10 shrink-0">
                      <span className="w-full h-full rounded-full bg-[#14103A] flex items-center justify-center font-display font-bold text-sm text-white">
                        {name.trim().charAt(0).toUpperCase() || 'H'}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-white text-sm truncate">{name}</span>
                      <span className="block text-[11px] text-white/45">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
