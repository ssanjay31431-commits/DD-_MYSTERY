import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/wishlist');
      setWishlist(data.products || []);
    } catch (error) {
      console.error('[Wishlist Error]', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      addToast('Please login to save to wishlist', 'info');
      return;
    }

    try {
      const { data } = await API.post('/wishlist/toggle', { productId });
      setWishlist(data.products || []);
      const exists = (data.products || []).some((p) => (p._id || p) === productId);
      if (exists) {
        addToast('Saved to Wishlist!', 'success');
      } else {
        addToast('Removed from Wishlist', 'info');
      }
    } catch (error) {
      addToast('Failed to update wishlist', 'error');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
