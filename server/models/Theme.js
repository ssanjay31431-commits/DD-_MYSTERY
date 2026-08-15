const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    previewImage: { type: String, default: '' },
    accentColor: { type: String, default: '#8b5cf6' },
    bgGradient: { type: String, default: 'from-purple-900 via-indigo-900 to-slate-900' },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theme', themeSchema);
