import React, { createContext, useContext, useState, useEffect } from 'react';
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
      setCartItems(data.items || []);
      setCouponApplied(data.couponApplied || { code: '', discountAmount: 0 });
      setLoading(false);
    } catch (error) {
      console.error('[Cart Fetch Error]', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('dd_guest_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    }
  }, [user]);

  const addToCart = async (product, customization, quantity = 1) => {
    if (user) {
      try {
        const { data } = await API.post('/cart/add', {
          productId: product._id,
          customization,
          quantity
        });
        setCartItems(data.items);
        addToast(`Added ${product.name} to Cart!`);
      } catch (error) {
        addToast(error.response?.data?.message || 'Failed to add item', 'error');
      }
    } else {
      // Local Guest Cart fallback
      const newItem = {
        _id: `guest_${Date.now()}`,
        product,
        customization,
        quantity,
        unitPrice: product.price
      };
      const updated = [...cartItems, newItem];
      setCartItems(updated);
      localStorage.setItem('dd_guest_cart', JSON.stringify(updated));
      addToast(`Added ${product.name} to Cart!`);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    if (user) {
      try {
        const { data } = await API.put(`/cart/item/${itemId}`, { quantity });
        setCartItems(data.items);
      } catch (error) {
        addToast('Failed to update item quantity', 'error');
      }
    } else {
      const updated = cartItems.map((item) => (item._id === itemId ? { ...item, quantity } : item));
      setCartItems(updated);
      localStorage.setItem('dd_guest_cart', JSON.stringify(updated));
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        const { data } = await API.delete(`/cart/item/${itemId}`);
        setCartItems(data.items);
        addToast('Item removed from cart', 'info');
      } catch (error) {
        addToast('Failed to remove item', 'error');
      }
    } else {
      const updated = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updated);
      localStorage.setItem('dd_guest_cart', JSON.stringify(updated));
      addToast('Item removed from cart', 'info');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await API.delete('/cart/clear');
      } catch (error) {
        console.error(error);
      }
    }
    setCartItems([]);
    setCouponApplied({ code: '', discountAmount: 0 });
    localStorage.removeItem('dd_guest_cart');
  };

  const applyCoupon = async (code) => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || item.product?.price || 0) * item.quantity, 0);
    try {
      const { data } = await API.post('/coupons/validate', { code, orderAmount: subtotal });
      if (data.valid) {
        setCouponApplied({ code: data.code, discountAmount: data.calculatedDiscount });
        addToast(data.message);
        return { success: true };
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Invalid Coupon', 'error');
      return { success: false };
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || item.product?.price || 0) * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 499 ? 0 : 49) : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - couponApplied.discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
