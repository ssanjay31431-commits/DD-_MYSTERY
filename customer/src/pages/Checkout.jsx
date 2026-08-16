import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Check, ShieldCheck, ArrowRight, User, Phone, Home, Building2, Lock, Loader, Navigation } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getDeviceLocation, getReverseGeocode, getLocationFromPincode, watchDeviceLocation, clearWatchLocation } from '../services/locationService';

export const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, deliveryFee, couponApplied, totalAmount, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settings, setSettings] = useState({ codAdvanceType: 'fixed', codAdvanceValue: 100 });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ADVANCE');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      addToast('Please select or add a delivery address', 'error');
      return;
    }

    setSubmittingPayment(true);

    try {
      const mockOrderId = `CF_MOCK_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const checkoutData = {
        paymentOrderId: mockOrderId,
        paymentSessionId: `session_${Date.now()}`,
        transactionId: `tx_${Date.now()}`,
        items: Array.isArray(cartItems) ? cartItems : [],
        deliveryAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod === 'FULL' ? 'FULL' : 'ADVANCE',
        couponCode: couponApplied?.code || ''
      };

      // Directly create order in MongoDB via backend API
      const { data } = await API.post('/orders/confirm-payment', checkoutData);

      if (data && data.success && data.order) {
        if (clearCart) clearCart();
        sessionStorage.removeItem('dd_checkout_payload');
        addToast('🎉 Order placed successfully and saved to database!');
        
        const finalId = data.order.orderNumber || data.order.orderId || data.order._id;
        navigate(`/order-success/${finalId}`);
      } else {
        const errMsg = data?.message || 'Order creation failed. Please try again.';
        addToast(errMsg, 'error');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to place order';
      addToast(errMsg, 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Compute dynamic advance and remaining balance
  const configuredAdvance = cartItems[0]?.product?.advanceAmount || settings?.advanceAmount || 100;
  const advanceRequired = selectedPaymentMethod === 'FULL'
    ? totalAmount
    : Math.min(totalAmount, configuredAdvance);
  const remainingBalance = Math.max(0, totalAmount - advanceRequired);
  const [loading, setLoading] = useState(true);

  // New Address Form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('Home');

  // Location tracking state
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [watchLocationId, setWatchLocationId] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const [addrRes, setRes] = await Promise.all([
          user && token ? API.get('/addresses').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          API.get('/settings').catch(() => ({ data: { codAdvanceType: 'fixed', codAdvanceValue: 100 } }))
        ]);

        const rawAddresses = addrRes.data;
        const fetchedAddresses = Array.isArray(rawAddresses) ? rawAddresses : [];
        setAddresses(fetchedAddresses);
        if (fetchedAddresses.length > 0) {
          const defaultAddr = fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0];
          setSelectedAddress(defaultAddr);
          setShowAddForm(false);
        } else {
          const cachedAddr = localStorage.getItem('dd_checkout_address');
          if (cachedAddr) {
            try {
              const parsed = JSON.parse(cachedAddr);
              setSelectedAddress(parsed);
              if (parsed.fullName) setFullName(parsed.fullName);
              if (parsed.mobileNumber) setMobileNumber(parsed.mobileNumber);
              if (parsed.houseNo) setHouseNo(parsed.houseNo);
              if (parsed.street) setStreet(parsed.street);
              if (parsed.area) setArea(parsed.area);
              if (parsed.city) setCity(parsed.city);
              if (parsed.state) setState(parsed.state);
              if (parsed.pincode) setPincode(parsed.pincode);
              setShowAddForm(false);
            } catch (e) {
              setShowAddForm(true);
            }
          } else {
            setShowAddForm(true);
          }
        }

        const rawSettings = setRes.data;
        setSettings(rawSettings && typeof rawSettings === 'object' && !rawSettings.message ? rawSettings : { codAdvanceType: 'fixed', codAdvanceValue: 100 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Cleanup watch location on unmount
  useEffect(() => {
    return () => {
      if (watchLocationId !== null) {
        clearWatchLocation(watchLocationId);
      }
    };
  }, [watchLocationId]);

  // Handle getting current location & auto-fill
  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getDeviceLocation();
      setLiveLocation(location);
      
      const address = await getReverseGeocode(location.latitude, location.longitude);
      
      const autoAddress = {
        fullName: (fullName || user?.name || '').trim(),
        mobileNumber: (mobileNumber || user?.phone || '').trim(),
        houseNo: (address.houseNo || houseNo || '').trim(),
        street: (address.street || street || '').trim(),
        area: (address.area || area || '').trim(),
        city: (address.city || city || '').trim(),
        district: (address.city || district || city || '').trim(),
        state: (address.state || state || '').trim(),
        pincode: (address.pincode || pincode || '').trim(),
        landmark: landmark || '',
        addressType: addressType || 'Home',
        latitude: location.latitude,
        longitude: location.longitude,
        isDefault: (Array.isArray(addresses) ? addresses : []).length === 0
      };

      if (autoAddress.fullName) setFullName(autoAddress.fullName);
      if (autoAddress.mobileNumber) setMobileNumber(autoAddress.mobileNumber);
      if (autoAddress.houseNo) setHouseNo(autoAddress.houseNo);
      if (autoAddress.street) setStreet(autoAddress.street);
      if (autoAddress.area) setArea(autoAddress.area);
      if (autoAddress.city) setCity(autoAddress.city);
      if (autoAddress.state) setState(autoAddress.state);
      if (autoAddress.pincode) setPincode(autoAddress.pincode);

      setSelectedAddress(autoAddress);
      localStorage.setItem('dd_checkout_address', JSON.stringify(autoAddress));
      addToast('Location detected successfully!');

      const token = localStorage.getItem('dd_token');
      if (user && token && autoAddress.fullName && autoAddress.mobileNumber && autoAddress.houseNo && autoAddress.street && autoAddress.pincode) {
        try {
          const { data } = await API.post('/addresses', autoAddress);
          const currentList = Array.isArray(addresses) ? addresses : [];
          setAddresses([data, ...currentList.filter(a => a._id !== data._id)]);
          setSelectedAddress(data);
          setShowAddForm(false);
          addToast('Address saved to your account!');
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    } catch (error) {
      addToast(error.message || 'Failed to get location', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle watch live location
  const handleWatchLocation = () => {
    if (watchLocationId !== null) {
      clearWatchLocation(watchLocationId);
      setWatchLocationId(null);
      addToast('Live location tracking stopped');
      return;
    }

    const id = watchDeviceLocation(
      (location) => {
        setLiveLocation(location);
      },
      (error) => {
        addToast(error.message, 'error');
      }
    );
    setWatchLocationId(id);
    addToast('Live location tracking started');
  };

  // Handle pincode change for auto-fill
  const handlePincodeChange = async (value) => {
    setPincode(value);
    
    if (value.length === 6) {
      setPincodeLoading(true);
      try {
        const locationInfo = await getLocationFromPincode(value);
        if (locationInfo.city) setCity(locationInfo.city);
        if (locationInfo.state) setState(locationInfo.state);
        if (locationInfo.area) setArea(locationInfo.area);
        addToast('Location auto-filled from pincode!');
      } catch (error) {
        console.error('Pincode lookup error:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    if (!fullName || !mobileNumber || !houseNo || !street || !area || !city || !state || !pincode) {
      addToast('Please complete all required address fields', 'error');
      return;
    }

    const cleanPhone = mobileNumber.replace(/[^\d]/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      addToast('Mobile number must be 10 digits', 'error');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      addToast('Pincode must be 6 digits', 'error');
      return;
    }

    const currentAddresses = Array.isArray(addresses) ? addresses : [];

    const addrData = {
      fullName: fullName.trim(),
      mobileNumber: cleanPhone,
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      district: (district || city).trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: (landmark || '').trim(),
      addressType: addressType || 'Home',
      latitude: liveLocation?.latitude,
      longitude: liveLocation?.longitude,
      isDefault: currentAddresses.length === 0
    };

    let savedOnBackend = false;
    const token = localStorage.getItem('dd_token');

    if (user && token) {
      try {
        const { data } = await API.post('/addresses', addrData);
        setAddresses([data, ...currentAddresses.filter(a => a._id !== data._id)]);
        setSelectedAddress(data);
        setShowAddForm(false);
        addToast('Delivery address saved successfully!');
        savedOnBackend = true;
      } catch (error) {
        console.error('Address save error:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Could not save to account';
        addToast(`${errorMsg}. Address selected for current checkout.`, 'info');
      }
    }

    if (!savedOnBackend) {
      setSelectedAddress(addrData);
      setShowAddForm(false);
      localStorage.setItem('dd_checkout_address', JSON.stringify(addrData));
      if (!user || !token) {
        addToast('Address saved for delivery! Please login to proceed.', 'info');
      }
    }
  };

  const addressList = Array.isArray(addresses) ? addresses : [];
  const itemList = Array.isArray(cartItems) ? cartItems : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl font-black text-white font-display">Checkout & Delivery Address</h1>
        <p className="text-xs text-slate-400 mt-1">Select your delivery location and payment option to complete your mystery box order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer & Delivery Address */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Customer Info Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-pink-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-slate-400">Name:</span>
                <span className="font-bold text-white text-sm">{user?.name || 'Guest User'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Email:</span>
                <span className="font-bold text-white text-sm">{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Phone:</span>
                <span className="font-bold text-white text-sm">{user?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Form / Selection */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {showAddForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {/* Saved Addresses List */}
            {!showAddForm && addressList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addressList.map((addr) => (
                  <div
                    key={addr._id || addr.houseNo}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddress?._id === addr._id
                        ? 'bg-purple-600/20 border-pink-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white text-sm">{addr.fullName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-pink-300">
                        {addr.addressType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {addr.houseNo}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Mobile: {addr.mobileNumber}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Form */}
            {showAddForm && (
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                
                {/* Location Detection Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {locationLoading ? <Loader className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {locationLoading ? 'Detecting...' : 'Use Current Location'}
                  </button>
                  <button
                    type="button"
                    onClick={handleWatchLocation}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 ${
                      watchLocationId !== null
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <Navigation className="w-3 h-3" />
                    {watchLocationId !== null ? 'Stop Live Location' : 'Start Live Location'}
                  </button>
                </div>

                {/* Live Location Display */}
                {liveLocation && (
                  <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/30 text-xs">
                    <p className="text-blue-400 font-bold mb-1">📍 Live Location</p>
                    <p className="text-slate-300">Latitude: {liveLocation.latitude.toFixed(4)}</p>
                    <p className="text-slate-300">Longitude: {liveLocation.longitude.toFixed(4)}</p>
                    <p className="text-slate-400 text-[10px] mt-1">Accuracy: ±{liveLocation.accuracy.toFixed(0)}m</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number *</label>
                    <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">House / Flat / Door Number *</label>
                    <input type="text" required value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Street / Road *</label>
                    <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Area / Locality *</label>
                    <input type="text" required value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
                    <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode * (Auto-fill City & State)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        value={pincode} 
                        onChange={(e) => handlePincodeChange(e.target.value)} 
                        placeholder="Enter 6-digit pincode"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" 
                      />
                      {pincodeLoading && <Loader className="w-3 h-3 animate-spin absolute right-3 top-2.5 text-blue-400" />}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
                    Save Address & Continue
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary & Select Payment Options */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6">
            <h3 className="text-lg font-bold text-white font-display border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {itemList.map((item) => (
                <div key={item._id} className="flex justify-between text-xs text-slate-300">
                  <span className="truncate max-w-[180px]">
                    {item.product?.name || 'Mystery Box'} (x{item.quantity})
                  </span>
                  <span className="font-bold text-white">₹{(item.unitPrice || item.product?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-400">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              {couponApplied?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{couponApplied.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-3">
                <span>Total Order Value</span>
                <span className="text-white">₹{totalAmount}</span>
              </div>
            </div>

            {/* Select Payment Method Cards */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> SELECT PAYMENT METHOD
              </h4>

              {/* OPTION 1: 💰 ADVANCE PAYMENT */}
              <div
                onClick={() => setSelectedPaymentMethod('ADVANCE')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'ADVANCE'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    💰 ADVANCE PAYMENT
                  </span>
                  {selectedPaymentMethod === 'ADVANCE' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Pay ₹{advanceRequired} online now.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Remaining Balance: <strong className="text-amber-300 font-bold">₹{remainingBalance}</strong>
                </p>
              </div>

              {/* OPTION 2: 💳 FULL ONLINE PAYMENT */}
              <div
                onClick={() => setSelectedPaymentMethod('FULL')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'FULL'
                    ? 'bg-purple-600/20 border-pink-500 text-white shadow-lg ring-1 ring-pink-500/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-pink-400 flex items-center gap-1.5">
                    💳 FULL ONLINE PAYMENT
                  </span>
                  {selectedPaymentMethod === 'FULL' && <Check className="w-4 h-4 text-pink-400" />}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Pay the complete ₹{totalAmount} online.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Remaining Balance: <strong className="text-emerald-400 font-bold">₹0</strong>
                </p>
              </div>
            </div>

            {/* Dynamic Breakdown Explanation Box */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-1.5 text-xs">
              <div className="flex justify-between text-amber-300 font-bold">
                <span>Online Paid Amount:</span>
                <span>₹{advanceRequired}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Remaining Balance:</span>
                <span className="font-bold text-white">₹{remainingBalance}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={submittingPayment}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-pink-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {selectedPaymentMethod === 'FULL' ? (
                <>PAY ₹{totalAmount} NOW →</>
              ) : (
                <>PAY ₹{advanceRequired} ADVANCE NOW →</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
