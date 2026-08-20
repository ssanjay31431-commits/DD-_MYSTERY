import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit3, Copy, Trash2, Eye, Package, Check, X, ShieldAlert } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?includeInactive=true');
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

  const handleDuplicate = async (id) => {
    try {
      const { data } = await API.post(`/products/${id}/duplicate`);
      addToast(`Product cloned as "${data.name}"`);
      fetchProducts();
    } catch (err) {
      addToast('Duplication failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product box tier?')) return;
    try {
      await API.delete(`/products/${id}`);
      addToast('Product box tier removed');
      fetchProducts();
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">Mystery Box Product Catalog</h1>
            <p className="text-xs text-slate-400">Create, edit, change prices, status, and manage individual box item photos.</p>
          </div>

          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-pink-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create New Box Tier
          </Link>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            Fetching product box catalog from MongoDB...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 sm:p-12 glass-panel rounded-3xl border border-purple-500/20 text-center space-y-4 max-w-lg mx-auto">
            <Package className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-lg font-bold text-white font-display">No Product Box Tiers Found</h3>
            <p className="text-xs text-slate-400">
              Your database currently has 0 product tiers. Create your first Mystery Box tier to show items on the customer website catalog!
            </p>
            <div className="pt-2">
              <Link
                to="/admin/products/new"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs uppercase inline-flex items-center gap-2 shadow-lg shadow-pink-500/30"
              >
                <Plus className="w-4 h-4" /> Create First Mystery Box Tier
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((prod) => (
              <div key={prod._id} className="glass-panel p-5 rounded-3xl border border-purple-500/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="relative mb-3">
                    <img src={prod.image} alt={prod.name} className="w-full h-44 object-cover rounded-2xl" />
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      prod.status === 'ACTIVE'
                        ? 'bg-emerald-500 text-slate-950'
                        : prod.status === 'OUT_OF_STOCK'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {prod.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-base">{prod.name}</h3>
                    <span className="text-base font-black text-pink-400 font-display">₹{prod.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                  
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between text-[11px] text-amber-300 font-bold">
                    <span>Box Items: {prod.contents?.length || 0} items</span>
                    <span>Stock: {prod.stock}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setPreviewProduct(prod)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" /> Preview
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(prod._id)}
                      className="p-2 rounded-xl bg-slate-900 text-amber-400 hover:text-white"
                      title="Duplicate Box Tier"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/admin/products/edit/${prod._id}`}
                      className="p-2 rounded-xl bg-slate-900 text-purple-400 hover:text-white"
                      title="Edit Product & Box Items"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(prod._id)}
                      className="p-2 rounded-xl bg-slate-900 text-rose-400 hover:text-rose-300"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Page Preview Modal */}
        {previewProduct && (
          <Modal isOpen={Boolean(previewProduct)} onClose={() => setPreviewProduct(null)} title="Customer View Preview">
            <div className="space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300 pr-1">
              <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-48 object-cover rounded-2xl" />
              <div>
                <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider">{previewProduct.tag}</span>
                <h2 className="text-xl font-bold text-white font-display">{previewProduct.name}</h2>
                <span className="text-2xl font-black text-pink-400 font-display">₹{previewProduct.price}</span>
              </div>
              <p className="text-xs text-slate-300">{previewProduct.description}</p>
              
              <div>
                <h4 className="font-bold text-amber-300 mb-2">"What's Inside?" Items ({previewProduct.contents?.length}):</h4>
                <div className="grid grid-cols-2 gap-2">
                  {previewProduct.contents?.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-white block text-[11px]">{item.name}</span>
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

      </main>
    </div>
  );
};
