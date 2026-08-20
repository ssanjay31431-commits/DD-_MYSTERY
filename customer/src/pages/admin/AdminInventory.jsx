import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Warehouse, Trash2 } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const [itemName, setItemName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Chocolates');
  const [quantity, setQuantity] = useState(100);
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [unitPrice, setUnitPrice] = useState(25);

  const fetchInventory = async () => {
    try {
      const { data } = await API.get('/inventory');
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/inventory', {
        itemName,
        sku,
        category,
        quantity: Number(quantity),
        lowStockThreshold: Number(lowStockThreshold),
        unitPrice: Number(unitPrice)
      });
      addToast('Inventory item added');
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete inventory item?')) return;
    try {
      await API.delete(`/inventory/${id}`);
      addToast('Item removed');
      fetchInventory();
    } catch (err) {
      addToast('Error removing item', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0c1b]">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Inventory & Raw Materials</h1>
            <p className="text-xs text-slate-400">Track chocolates, keychains, stickers, toys, packaging & low-stock warnings.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        </div>

        {/* Low Stock Warning Banner if any item is low stock */}
        {items.some((i) => i.status === 'Low Stock' || i.status === 'Out of Stock') && (
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block">Low Stock Alert Detected!</span>
              <span>Some workshop inventory items are below threshold. Reorder stock soon to avoid order delays.</span>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">In Stock Qty</th>
                <th className="p-4">Threshold</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-pink-300">{item.sku}</td>
                  <td className="p-4 font-bold text-white">{item.itemName}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4 font-bold text-amber-300">{item.quantity} {item.unit}</td>
                  <td className="p-4 text-slate-400">{item.lowStockThreshold} {item.unit}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      item.status === 'Low Stock' || item.status === 'Out of Stock'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item._id)} className="text-rose-400 hover:text-rose-300 font-bold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Material">
          <form onSubmit={handleAdd} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1">Item Name</label>
              <input type="text" required placeholder="Assorted Chocolates Pack" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">SKU Code</label>
                <input type="text" required placeholder="SKU-CHOC-02" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white uppercase" />
              </div>
              <div>
                <label className="block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                  <option value="Chocolates">Chocolates</option>
                  <option value="Keychains">Keychains</option>
                  <option value="Stickers">Stickers</option>
                  <option value="Toys">Toys</option>
                  <option value="Cards">Cards</option>
                  <option value="Balloons">Balloons</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Stock Quantity</label>
                <input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block mb-1">Low Stock Warning Threshold</label>
                <input type="number" required value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
              Save Inventory Item
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
