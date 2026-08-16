const mongoose = require('mongoose');

const boxItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  category: { type: String, default: 'Collectibles' },
  isMystery: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    tag: { type: String, default: '' }, // e.g. "90s NOSTALGIA", "CHOCO SURPRISE"
    tagline: { type: String, default: '' },
    description: { type: String, required: true },
    fullDescription: { type: String, default: '' },
    contents: [boxItemSchema], // Rich Box Items with Images
    highlights: [{ type: String }],
    features: [{ type: String }],
    image: { type: String, required: true },
    galleryImages: [{ type: String }],
    categoryName: { type: String, default: 'Mystery Box' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'OUT_OF_STOCK'],
      default: 'ACTIVE'
    },
    isFeatured: { type: Boolean, default: true },
    stock: { type: Number, default: 100 },
    sku: { type: String, default: '' },
    weight: { type: String, default: '500g' },
    deliveryCharge: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 100 },
    rating: { type: Number, default: 4.9 },
    numReviews: { type: Number, default: 24 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
