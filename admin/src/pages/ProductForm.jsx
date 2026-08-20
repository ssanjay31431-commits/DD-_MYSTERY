import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';
import { ImageUploader } from '../components/ImageUploader';

export const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(499);
  const [originalPrice, setOriginalPrice] = useState(799);
  const [tag, setTag] = useState('90s NOSTALGIA');
  const [tagline, setTagline] = useState('Relive Childhood Memories!');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [image, setImage] = useState('');
  const [categoryName, setCategoryName] = useState('Nostalgia Mystery Box');
  const [status, setStatus] = useState('ACTIVE');
  const [stock, setStock] = useState(200);
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('500g');
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Dynamic Box Items with Images
  const [contents, setContents] = useState([
    { name: 'Poppins', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80', description: 'Classic candy', quantity: 1, isMystery: false }
  ]);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setName(data.name);
      setSlug(data.slug);
      setPrice(data.price);
      setOriginalPrice(data.originalPrice);
      setTag(data.tag || '');
      setTagline(data.tagline || '');
      setDescription(data.description);
      setFullDescription(data.fullDescription || data.description);
      setImage(data.image);
      setCategoryName(data.categoryName || 'Mystery Box');
      setStatus(data.status || 'ACTIVE');
      setStock(data.stock || 100);
      setSku(data.sku || '');
      setWeight(data.weight || '500g');
      setDeliveryCharge(data.deliveryCharge || 0);
      setContents(data.contents || []);
    } catch (err) {
      addToast('Failed to load product details', 'error');
    }
  };

  const handleAddBoxItem = () => {
    setContents([
      ...contents,
      {
        name: '',
        image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48?auto=format&fit=crop&w=300&q=80',
        description: '',
        quantity: 1,
        isMystery: false
      }
    ]);
  };

  const handleUpdateBoxItem = (index, field, value) => {
    const updated = [...contents];
    updated[index][field] = value;
    setContents(updated);
  };

  const handleRemoveBoxItem = (index) => {
    setContents(contents.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      addToast('Please upload a Main Product Image', 'error');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(price),
      originalPrice: Number(originalPrice),
      tag,
      tagline,
      description,
      fullDescription,
      contents,
      image,
      categoryName,
      status,
      stock: Number(stock),
      sku,
      weight,
      deliveryCharge: Number(deliveryCharge)
    };

    try {
      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        addToast('Mystery Box updated successfully');
      } else {
        await API.post('/products', payload);
        addToast('New Mystery Box published to Customer Website!');
      }
      navigate('/admin/products');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white font-display">
                {isEdit ? `Edit: ${name}` : 'Create New Mystery Box Tier'}
              </h1>
              <p className="text-xs text-slate-400">Upload images directly from your computer or paste image links.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-base font-bold text-white font-display border-b border-slate-800 pb-2">
              1. Basic Box Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-300">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DD MYSTERY BOX – 90s KIDS EDITION"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">URL Slug (Auto-generated if blank)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="dd-mystery-box-90s-kids-edition"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Sale Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Original Price (M.R.P. ₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Badge Tag</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. 90s NOSTALGIA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Relive Childhood Memories!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            </div>

            {/* Direct Image File Upload Component */}
            <ImageUploader
              label="Main Product Image (File Upload or URL)"
              value={image}
              onChange={setImage}
            />

            <div>
              <label className="block mb-1 font-bold text-slate-300 text-xs">Short Description</label>
              <textarea
                rows="2"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          {/* Section 2: Box Status & Stock */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-base font-bold text-white font-display border-b border-slate-800 pb-2">
              2. Status & Inventory Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-300">Product Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Customer Site)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from Customer Site)</option>
                  <option value="DRAFT">DRAFT (Draft Mode)</option>
                  <option value="OUT_OF_STOCK">OUT OF STOCK (Visible but disabled)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Available Stock Quantity</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-300">Category</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: "What's Inside?" Box Items Manager */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-300 font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> 3. "What's Inside?" Box Items (Upload photos for every item)
                </h3>
                <p className="text-xs text-slate-400">Upload item photos directly from your device. Customers see these photos on the Product Details page.</p>
              </div>

              <button
                type="button"
                onClick={handleAddBoxItem}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Box Item
              </button>
            </div>

            <div className="space-y-4">
              {contents.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-amber-400">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBoxItem(idx)}
                      className="p-1.5 rounded-lg bg-slate-950 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block mb-1 text-[11px] font-bold text-slate-300">Item Name</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateBoxItem(idx, 'name', e.target.value)}
                          placeholder="e.g. Poppins"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-[11px] text-slate-400">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateBoxItem(idx, 'description', e.target.value)}
                          placeholder="Classic candy"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <label className="block mb-1 text-[11px] text-slate-400">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateBoxItem(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                          />
                        </div>

                        <label className="flex items-center gap-2 mt-4 text-[11px] font-bold text-purple-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isMystery}
                            onChange={(e) => handleUpdateBoxItem(idx, 'isMystery', e.target.checked)}
                            className="rounded border-slate-800 text-purple-600 focus:ring-0"
                          />
                          Mystery Item?
                        </label>
                      </div>
                    </div>

                    {/* Direct Image File Upload Component for Box Item */}
                    <div>
                      <ImageUploader
                        label="Item Photo (File Upload or URL)"
                        value={item.image}
                        onChange={(img) => handleUpdateBoxItem(idx, 'image', img)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Publishing Changes...' : isEdit ? 'SAVE & PUBLISH UPDATES' : 'PUBLISH PRODUCT TO CUSTOMER WEBSITE'}
          </button>
        </form>

      </main>
    </div>
  );
};
