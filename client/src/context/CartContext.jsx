import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [couponApplied, setCouponApplied] = useState({ code: '', discountAmount: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch user cart when logged in
  const fetchCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        setCartItems(data.items);
        localStorage.setItem('dd_guest_cart', JSON.stringify(data.items));
      }
    } catch (error) {
      console.warn('[Cart Fetch Notice] Backend unavailable, using local cart:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const localCart = localStorage.getItem('dd_guest_cart');
    let initialCart = [];
    if (localCart) {
      try {
        initialCart = JSON.parse(localCart);
      } catch (e) {}
    }
    if (Array.isArray(initialCart) && initialCart.length > 0) {
      setCartItems(initialCart);
    }

    if (user) {
      fetchCart();
    }
  }, [user]);

  const addToCart = async (product, customization, quantity = 1) => {
    if (!product) return;

    const newItem = {
      _id: `item_${Date.now()}`,
      product,
      customization,
      quantity,
      unitPrice: product.price || 499
    };

    if (user) {
      try {
        const { data } = await API.post('/cart/add', {
          productId: product._id,
          customization,
          quantity
        });
        if (data && Array.isArray(data.items)) {
          setCartItems(data.items);
          localStorage.setItem('dd_guest_cart', JSON.stringify(data.items));
          addToast(`Added ${product.name || 'Mystery Box'} to Cart!`);
          return;
        }
      } catch (error) {
        console.warn('API cart/add endpoint notice, storing locally:', error.message);
      }
    }

    // Local state & storage fallback (works 100% whether user is logged in or guest)
    const currentList = Array.isArray(cartItems) ? cartItems : [];
    const updated = [...currentList, newItem];
    setCartItems(updated);
    localStorage.setItem('dd_guest_cart', JSON.stringify(updated));
    addToast(`Added ${product.name || 'Mystery Box'} to Cart!`);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    const currentList = Array.isArray(cartItems) ? cartItems : [];
    const updated = currentList.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('dd_guest_cart', JSON.stringify(updated));

    if (user) {
      try {
        await API.put(`/cart/item/${itemId}`, { quantity });
      } catch (error) {
        console.warn('Backend update quantity notice:', error.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const currentList = Array.isArray(cartItems) ? cartItems : [];
    const updated = currentList.filter((item) => item._id !== itemId);
    setCartItems(updated);
    localStorage.setItem('dd_guest_cart', JSON.stringify(updated));
    addToast('Item removed from cart', 'info');

    if (user) {
      try {
        await API.delete(`/cart/item/${itemId}`);
      } catch (error) {
        console.warn('Backend remove item notice:', error.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setCouponApplied({ code: '', discountAmount: 0 });
    localStorage.removeItem('dd_guest_cart');

    if (user) {
      try {
        await API.delete('/cart/clear');
      } catch (error) {
        console.warn('Backend clear cart notice:', error.message);
      }
    }
  };

  const applyCoupon = async (code) => {
    const currentList = Array.isArray(cartItems) ? cartItems : [];
    const subtotalVal = currentList.reduce((acc, item) => acc + (item.unitPrice || item.product?.price || 0) * item.quantity, 0);

    try {
      const { data } = await API.post('/coupons/validate', { code, orderAmount: subtotalVal });
      if (data.valid) {
        setCouponApplied({ code: data.code, discountAmount: data.calculatedDiscount });
        addToast(data.message);
        return { success: true };
      }
    } catch (error) {
      // Local coupon code validation fallback
      const cleanCode = code?.trim().toUpperCase();
      if (cleanCode === 'WELCOME50') {
        const discount = Math.round(subtotalVal * 0.5);
        setCouponApplied({ code: 'WELCOME50', discountAmount: discount });
        addToast('50% OFF Welcome Coupon applied!');
        return { success: true };
      } else if (cleanCode === 'DD100') {
        const discount = Math.min(100, subtotalVal);
        setCouponApplied({ code: 'DD100', discountAmount: discount });
        addToast('₹100 Flat Coupon applied!');
        return { success: true };
      }
      addToast(error.response?.data?.message || 'Invalid Coupon Code', 'error');
      return { success: false };
    }
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = safeCartItems.reduce((acc, item) => acc + (item.unitPrice || item.product?.price || 0) * item.quantity, 0);
  const deliveryFee = 0;
  const totalAmount = Math.max(0, subtotal - couponApplied.discountAmount);

  const value = useMemo(
    () => ({
      cartItems: safeCartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      couponApplied,
      subtotal,
      deliveryFee,
      totalAmount
    }),
    [safeCartItems, loading, couponApplied, subtotal, deliveryFee, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
