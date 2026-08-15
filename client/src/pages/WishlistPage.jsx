import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export const WishlistPage = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-display">My Wishlist</h1>
          <p className="text-xs text-slate-400">Your favorite saved birthday surprise box tiers.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Click the heart icon on any mystery box card to save it to your wishlist!"
          icon={Heart}
          actionText="Browse Boxes"
          actionLink="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {wishlist.map((product) => (
            <ProductCard key={product._id || product} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
