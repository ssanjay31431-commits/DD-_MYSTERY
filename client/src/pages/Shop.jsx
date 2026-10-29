import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Sparkles } from 'lucide-react';

export const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setLoading(true);
      setError('');
      API.get('/products', {
        params: { page, limit: 12, search: searchTerm },
        signal: controller.signal
      })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            const query = searchTerm.toLowerCase();
            const matchingProducts = data.filter((product) =>
              product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
            );
            const start = (page - 1) * 12;
            setProducts(matchingProducts.slice(start, start + 12));
            setHasNext(matchingProducts.length > start + 12);
            return;
          }
          setProducts(data.products || []);
          setHasNext(data.hasNext);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error('Shop product request failed:', err);
          setError(err.response?.data?.message || 'Products could not be loaded. Please try again.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [page, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black text-pink-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
          <Sparkles className="w-3.5 h-3.5" /> All Birthday Surprise Boxes
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
          Explore Our Mystery Boxes
        </h1>
        <p className="text-slate-400 text-sm">
          Select a box tier tailored to your budget. Every box is 100% customizable with your recipient's name, favorite colors, themes and birthday message!
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search boxes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-rose-300" role="alert">{error}</div>
      ) : products.length === 0 ? (
        <EmptyState title="No Boxes Found" description="Try searching for a different box tier or clear your query." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-sm font-bold text-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">Page {page}</span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => setPage((current) => current + 1)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-sm font-bold text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
