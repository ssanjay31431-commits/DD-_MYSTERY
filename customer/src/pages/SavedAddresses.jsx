import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Home, Check } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';

export const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('Home');

  const fetchAddresses = async () => {
    try {
      const { data } = await API.get('/addresses');
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!fullName || !mobileNumber || !houseNo || !street || !area || !city || !state || !pincode) {
      addToast('Please complete all required address fields', 'error');
      return;
    }
    try {
      await API.post('/addresses', {
        fullName,
        mobileNumber,
        houseNo,
        street,
        area,
        city,
        district: city,
        state,
        pincode,
        landmark: landmark.trim(),
        addressType,
        isDefault: addresses.length === 0
      });
      addToast('Address added!');
      setFullName('');
      setMobileNumber('');
      setHouseNo('');
      setStreet('');
      setArea('');
      setCity('');
      setState('');
      setPincode('');
      setLandmark('');
      setShowAddForm(false);
      fetchAddresses();
    } catch (err) {
      console.error('Address add error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add address';
      addToast(errorMsg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/addresses/${id}`);
      addToast('Address removed', 'info');
      fetchAddresses();
    } catch (err) {
      addToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white font-display">Saved Addresses</h1>
            <p className="text-xs text-slate-400">Manage your shipping destinations for quick checkout.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl border border-pink-500/30 space-y-4">
          <h3 className="text-sm font-bold text-pink-400 uppercase">New Address Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" required placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="tel" required placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="House / Flat No" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="Street / Road" value={street} onChange={(e) => setStreet(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="Area / Locality" value={area} onChange={(e) => setArea(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" placeholder="Landmark (Optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
            <input type="text" required placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs" />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
            Save Address
          </button>
        </form>
      )}

      {addresses.length === 0 && !showAddForm ? (
        <EmptyState title="No Saved Addresses" description="Save shipping addresses to complete checkouts faster." icon={MapPin} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="glass-panel p-5 rounded-2xl border border-purple-500/20 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white text-sm">{addr.fullName}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    {addr.addressType}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {addr.houseNo}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Phone: {addr.mobileNumber}</p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800 mt-3">
                <button onClick={() => handleDelete(addr._id)} className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
