// Utility for safe browser storage operations with sanitization, quota management & memory fallback

export const sanitizeProduct = (product) => {
  if (!product) return null;
  if (typeof product === 'string') return product;

  let mainImage = product.image || '';
  if (!mainImage && Array.isArray(product.images) && product.images.length > 0) {
    mainImage = product.images[0];
  }

  return {
    _id: product._id || product.id,
    name: product.name || 'DD Mystery Box',
    price: product.price || 499,
    image: mainImage,
    description: typeof product.description === 'string' ? product.description.slice(0, 300) : '',
    contents: Array.isArray(product.contents) ? product.contents.slice(0, 10) : []
  };
};

export const sanitizeItem = (item) => {
  if (!item) return null;
  const customization = item.customization ? { ...item.customization } : {};
  
  return {
    _id: item._id,
    product: sanitizeProduct(item.product),
    customization,
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || item.price || item.product?.price || 499
  };
};

export const sanitizeCheckoutData = (checkoutData) => {
  if (!checkoutData) return null;
  return {
    items: Array.isArray(checkoutData.items) ? checkoutData.items.map(sanitizeItem) : [],
    deliveryAddress: checkoutData.deliveryAddress || null,
    subtotal: checkoutData.subtotal || 0,
    deliveryFee: checkoutData.deliveryFee || 0,
    couponDiscount: checkoutData.couponDiscount || 0,
    couponCode: checkoutData.couponCode || '',
    totalAmount: checkoutData.totalAmount || 0
  };
};

export const safeSetSessionItem = (key, value) => {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    sessionStorage.setItem(key, jsonStr);
    window[`__DD_MEM_${key}__`] = typeof value === 'string' ? JSON.parse(value) : value;
    return true;
  } catch (err) {
    console.warn(`[Storage Warning] sessionStorage.setItem failed for key "${key}" (${err.message}). Attempting cleanup...`);

    // Clean up non-critical items to free up quota
    try {
      if (key !== 'dd_buynow_item') sessionStorage.removeItem('dd_buynow_item');
      if (key !== 'dd_pending_checkout') sessionStorage.removeItem('dd_pending_checkout');
    } catch (e) {}

    // Retry setting item
    try {
      sessionStorage.setItem(key, jsonStr);
      window[`__DD_MEM_${key}__`] = typeof value === 'string' ? JSON.parse(value) : value;
      return true;
    } catch (err2) {
      console.error(`[Storage Error] Could not save to sessionStorage after cleanup. Fallback to memory:`, err2);
      window[`__DD_MEM_${key}__`] = typeof value === 'string' ? JSON.parse(value) : value;
      return false;
    }
  }
};

export const safeGetSessionItem = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    if (item) return item;
  } catch (err) {
    console.warn(`[Storage Warning] sessionStorage.getItem failed for key "${key}":`, err);
  }
  const memItem = window[`__DD_MEM_${key}__`];
  if (memItem !== undefined) {
    return typeof memItem === 'string' ? memItem : JSON.stringify(memItem);
  }
  return null;
};

export const safeRemoveSessionItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {}
  delete window[`__DD_MEM_${key}__`];
};

export const safeSetLocalItem = (key, value) => {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(key, jsonStr);
    return true;
  } catch (err) {
    console.warn(`[Storage Warning] localStorage.setItem failed for key "${key}" (${err.message}). Attempting cleanup...`);
    try {
      if (key !== 'dd_guest_cart') {
        localStorage.removeItem('dd_orders');
      }
      localStorage.setItem(key, jsonStr);
      return true;
    } catch (err2) {
      console.error(`[Storage Error] localStorage quota exceeded:`, err2);
      return false;
    }
  }
};

export const safeGetLocalItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Storage Warning] localStorage.getItem failed for key "${key}":`, err);
    return null;
  }
};
