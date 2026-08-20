import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Palette } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminThemes = () => {
  const [themes, setThemes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [isPopular, setIsPopular] = useState(false);

  const fetchThemes = async () => {
    try {
      const { data } = await API.get('/themes');
      setThemes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const openForm = (theme = null) => {
    if (theme) {
      setEditingTheme(theme);
      setName(theme.name);
      setCategory(theme.category || 'General');
      setAccentColor(theme.accentColor || '#8b5cf6');
      setIsPopular(theme.isPopular || false);
    } else {
      setEditingTheme(null);
      setName('');
      setCategory('General');
      setAccentColor('#8b5cf6');
      setIsPopular(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, category, accentColor, isPopular };
    try {
      if (editingTheme) {
        await API.put(`/themes/${editingTheme._id}`, payload);
        addToast('Theme updated!');
      } else {
        await API.post('/themes', payload);
        addToast('New theme created!');
      }
      setShowModal(false);
      fetchThemes();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theme?')) return;
    try {
      await API.delete(`/themes/${id}`);
      addToast('Theme deleted');
      fetchThemes();
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Manage Birthday Themes</h1>
            <p className="text-xs text-slate-400">Add or edit customizable birthday box themes available for customers.</p>
          </div>
          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Theme
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {themes.map((t) => (
            <div key={t._id} className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-center space-y-2">
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-base shadow-md"
                style={{ backgroundColor: t.accentColor }}
              >
                {t.name.charAt(0)}
              </div>
              <h4 className="font-bold text-white text-sm">{t.name}</h4>
              <span className="text-[10px] text-slate-400 block">{t.category}</span>

              <div className="flex justify-center gap-2 pt-2">
                <button onClick={() => openForm(t)} className="p-1.5 rounded-lg bg-slate-900 text-purple-400 hover:text-white">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTheme ? 'Edit Theme' : 'Add Theme'}>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block mb-1">Theme Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div>
              <label className="block mb-1">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>

            <div>
              <label className="block mb-1">Accent Hex Color</label>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-10 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="pop" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded" />
              <label htmlFor="pop">Mark as Popular Theme</label>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase">
              Save Theme
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};
