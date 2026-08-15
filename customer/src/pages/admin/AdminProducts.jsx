import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Check, Package } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(499);
  const [originalPrice, setOriginalPrice] = useState(799);
  const [tag, setTag] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState('');
  const [features, setFeatures] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState(100);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openForm = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setPrice(prod.price);
      setOriginalPrice(prod.originalPrice || prod.price + 200);
      setTag(prod.tag || '');
      setTagline(prod.tagline || '');
      setDescription(prod.description);
      setContents(prod.contents ? prod.contents.join('\n') : '');
      setFeatures(prod.features ? prod.features.join('\n') : '');
      setImage(prod.image);
      setStock(prod.stock || 100);
    } else {
      setEditingProduct(null);
      setName('');
      setPrice(499);
      setOriginalPrice(799);
      setTag('90s NOSTALGIA');
      setTagline('Relive Childhood Memories!');
      setDescription('');
      setContents('');
      setFeatures('');
      setImage('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80');
      setStock(100);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      tag,
      tagline,
      description,
      contents: contents.split('\n').map((s) => s.trim()).filter(Boolean),
      features: features.split('\n').map((s) => s.trim()).filter(Boolean),
      image,
      stock: Number(stock)
    };

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, payload);
        addToast('Mystery Box updated successfully');
      } else {
        await API.post('/products', payload);
        addToast('New Mystery Box created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mystery box product?')) return;
    try {
      await API.delete(`/products/${id}`);
      addToast('Product removed');
      fetchProducts();
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Manage Mystery Box Products</h1>
            <p className="text-xs text-slate-400">Add, edit, change prices, description, and "What's Inside" contents array in MongoDB.</p>
          </div>
          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Box Tier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div key={prod._id} className="glass-panel p-5 rounded-2xl border border-purple-500/20 flex flex-col justify-between">
              <div>
                <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white text-base">{prod.name}</h3>
                  <span className="text-sm font-black text-pink-400 font-display">₹{prod.price}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                {prod.contents && (
                  <p className="text-[11px] text-amber-300 font-bold mt-2">
                    Box Contents: {prod.contents.length} items listed
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
                <button onClick={() => openForm(prod)} className="p-2 rounded-xl bg-slate-900 text-purple-400 hover:text-white" title="Edit Box">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(prod._id)} className="p-2 rounded-xl bg-slate-900 text-rose-400 hover:text-rose-300" title="Delete Box">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Box Tier' : 'Add New Box Tier'}>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="block mb-1 font-bold text-white">Box Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold text-white">Price (₹)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block mb-1 font-bold text-white">Original Price (₹)</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold text-white">Badge Tag (e.g. 90s NOSTALGIA)</label>
                <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block mb-1 font-bold text-white">Tagline</label>
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-white">Description</label>
              <textarea rows="3" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div>
              <label className="block mb-1 font-bold text-amber-300">Box Contents ("What's Inside?" - One item per line)</label>
              <textarea rows="6" value={contents} onChange={(e) => setContents(e.target.value)} placeholder="Poppins&#10;Mango Bite&#10;Melody&#10;Water Ring Game..." className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white font-mono text-xs" />
            </div>

            <div>
              <label className="block mb-1 font-bold text-white">Features (One per line)</label>
              <textarea rows="3" value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div>
              <label className="block mb-1 font-bold text-white">Image URL</label>
              <input type="url" required value={image} onChange={(e) => setImage(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider">
              Save Box Product
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
