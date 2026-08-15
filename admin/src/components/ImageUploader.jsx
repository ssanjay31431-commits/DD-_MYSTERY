import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';

export const ImageUploader = ({ value, onChange, label = 'Upload Image', placeholder = 'Click or drag image file here...' }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        onChange(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-slate-300">{label}</label>}

      {value ? (
        /* Image Preview Box */
        <div className="relative group p-2.5 rounded-2xl bg-slate-900 border border-purple-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-14 h-14 rounded-xl object-cover border border-purple-500/40 shrink-0 bg-slate-950"
            />
            <div className="truncate text-xs">
              <span className="font-bold text-emerald-400 block flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Image Loaded & Ready
              </span>
              <span className="text-[10px] text-slate-400 truncate block max-w-xs font-mono">
                {value.startsWith('data:image') ? 'Uploaded Local Image File' : value}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Replace
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-xl bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-slate-700 transition-all"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        /* File Upload Drop Area */
        <div>
          {!showUrlInput ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer p-5 rounded-2xl bg-slate-900/90 border-2 border-dashed border-purple-500/30 hover:border-pink-500/60 hover:bg-purple-950/20 transition-all flex flex-col items-center justify-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <span className="font-bold text-white text-xs block">
                  📁 Click or Drag & Drop Image File
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Supports PNG, JPG, JPEG, WEBP, GIF
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlInput(true);
                }}
                className="text-[10px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <LinkIcon className="w-3 h-3" /> Or paste image web URL instead
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* URL Paste Fallback Form */
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Paste Image Web URL:</span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  ← Back to File Upload
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
