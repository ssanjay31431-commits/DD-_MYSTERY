const Product = require('../models/Product');

const DEFAULT_MYSTERY_BOXES = [
  {
    name: 'DD MYSTERY BOX – 90s KIDS EDITION',
    slug: 'dd-mystery-box-90s-kids-edition',
    price: 499,
    originalPrice: 799,
    tag: '90s NOSTALGIA 🎁',
    tagline: 'Relive Childhood Memories & Pure Nostalgia!',
    description: 'A grand childhood nostalgia mystery box packed with authentic 90s candies, retro games, toys, memory keepsakes and lucky rewards!',
    fullDescription: 'Experience the magic of 90s childhood! Every box contains 16 carefully curated nostalgic collectibles including classic candies, retro toys, and a chance to win ₹5,000 in our scratch reward card.',
    contents: [
      { name: 'Poppins Roll', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80', description: 'Classic colorful candy roll', quantity: 1, category: 'Candy' },
      { name: 'Mango Bite', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=300&q=80', description: 'Authentic mango candy', quantity: 2, category: 'Candy' },
      { name: 'Melody', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=300&q=80', description: 'Melody chocolaty candy', quantity: 2, category: 'Candy' },
      { name: 'Boomer Bubble Gum', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=300&q=80', description: 'Boomer bubble gum', quantity: 1, category: 'Gum' },
      { name: 'Water Ring Toss Game', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=300&q=80', description: 'Handheld handheld water ring toss toy', quantity: 1, category: 'Toy' },
      { name: 'Spinning Top / Bambaram', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80', description: 'Wooden spinning top toy with string', quantity: 1, category: 'Toy' },
      { name: 'Glass Marbles Set', image: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=300&q=80', description: 'Pack of 10 colorful glass marbles', quantity: 1, category: 'Toy' },
      { name: 'Back to Childhood Card', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', description: 'Nostalgic greeting card with custom message', quantity: 1, category: 'Card' }
    ],
    highlights: [
      'Packed with Nostalgia, Fun & Surprises!',
      'Relive Childhood Memories',
      'Perfect Gift for All Occasions',
      'Premium Quality Packaging'
    ],
    features: [
      '16+ Authentic Nostalgia Items',
      'Retro Water Ring Game & Bambaram',
      'Back to Childhood Thank You Card',
      'Eligible for ₹5,000 Lucky Scratch Reward'
    ],
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Nostalgia Mystery Box',
    status: 'ACTIVE',
    isFeatured: true,
    stock: 200,
    rating: 4.9,
    numReviews: 142
  },
  {
    name: 'DD CHOCO MYSTERY BOX',
    slug: 'dd-choco-mystery-box',
    price: 199,
    originalPrice: 399,
    tag: 'CHOCO SURPRISE 🍫',
    tagline: '5 Surprise Gifts + Large Brand Chocolates!',
    description: 'The ultimate chocolate surprise mystery box loaded with large brand chocolates, 5 surprise gifts, and a chance to discover MrBeast Chocolate!',
    fullDescription: 'Indulge in rich chocolate surprises! Packed with large full-size brand chocolate bars plus 5 handpicked surprise gifts.',
    contents: [
      { name: 'Dairy Milk Large', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=300&q=80', description: 'Full size Cadbury Dairy Milk bar', quantity: 1, category: 'Chocolate' },
      { name: 'KitKat Large', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80', description: 'Full size Nestlé KitKat 4-finger bar', quantity: 1, category: 'Chocolate' },
      { name: '5 Surprise Gifts', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48?auto=format&fit=crop&w=300&q=80', description: '5 handpicked surprise gifts & MrBeast chance', quantity: 5, isMystery: true, category: 'Surprise' }
    ],
    highlights: [
      '5 Surprise Gifts Inside!',
      'Chance to Get MrBeast Chocolate',
      '100% Original Products'
    ],
    features: [
      'Full-size Brand Chocolates',
      '5 Handpicked Surprise Gifts',
      'Chance to win MrBeast Chocolate'
    ],
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Choco Mystery Box',
    status: 'ACTIVE',
    isFeatured: true,
    stock: 300,
    rating: 4.8,
    numReviews: 94
  }
];

// @desc Get all products (Filter ACTIVE for customer, All for admin)
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { status, category, search, includeInactive } = req.query;
    let filter = {};

    if (includeInactive !== 'true' && req.user?.role !== 'admin') {
      filter.status = 'ACTIVE';
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categoryName = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    // Auto-seed default initial products if MongoDB collection is empty
    if (products.length === 0) {
      const totalCount = await Product.countDocuments();
      if (totalCount === 0) {
        try {
          await Product.insertMany(DEFAULT_MYSTERY_BOXES);
          products = await Product.find(filter).sort({ createdAt: -1 }).lean();
        } catch (e) {
          console.warn('Auto-seed default products notice:', e.message);
        }
      }
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get product by ID or Slug
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const param = req.params.id;
    let product;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param).lean();
    } else {
      product = await Product.findOne({ slug: param }).lean();
    }

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product box tier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Create New Product
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      originalPrice,
      tag,
      tagline,
      description,
      fullDescription,
      contents,
      highlights,
      features,
      image,
      galleryImages,
      categoryName,
      status = 'ACTIVE',
      isFeatured = true,
      stock = 100,
      sku,
      weight,
      deliveryCharge = 0
    } = req.body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = new Product({
      name,
      slug: generatedSlug,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      tag: tag || '',
      tagline: tagline || '',
      description,
      fullDescription: fullDescription || description,
      contents: Array.isArray(contents) ? contents : [],
      highlights: Array.isArray(highlights) ? highlights : [],
      features: Array.isArray(features) ? features : [],
      image,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      categoryName: categoryName || 'Mystery Box',
      status,
      isFeatured,
      stock: Number(stock),
      sku: sku || `SKU-${Date.now()}`,
      weight: weight || '500g',
      deliveryCharge: Number(deliveryCharge)
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin Update Product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.price = req.body.price ?? product.price;
      product.originalPrice = req.body.originalPrice ?? product.originalPrice;
      product.tag = req.body.tag ?? product.tag;
      product.tagline = req.body.tagline ?? product.tagline;
      product.description = req.body.description || product.description;
      product.fullDescription = req.body.fullDescription || product.fullDescription;
      product.contents = req.body.contents || product.contents;
      product.highlights = req.body.highlights || product.highlights;
      product.features = req.body.features || product.features;
      product.image = req.body.image || product.image;
      product.galleryImages = req.body.galleryImages || product.galleryImages;
      product.categoryName = req.body.categoryName || product.categoryName;
      product.status = req.body.status || product.status;
      product.isFeatured = req.body.isFeatured ?? product.isFeatured;
      product.stock = req.body.stock ?? product.stock;
      product.sku = req.body.sku || product.sku;
      product.weight = req.body.weight || product.weight;
      product.deliveryCharge = req.body.deliveryCharge ?? product.deliveryCharge;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin Duplicate Product Tier
// @route POST /api/products/:id/duplicate
const duplicateProduct = async (req, res) => {
  try {
    const sourceProduct = await Product.findById(req.params.id);
    if (!sourceProduct) {
      return res.status(404).json({ message: 'Source product tier not found' });
    }

    const newName = `${sourceProduct.name} (Copy)`;
    const newSlug = `${sourceProduct.slug}-copy-${Date.now()}`;

    const clonedProduct = new Product({
      name: newName,
      slug: newSlug,
      price: sourceProduct.price,
      originalPrice: sourceProduct.originalPrice,
      tag: sourceProduct.tag,
      tagline: sourceProduct.tagline,
      description: sourceProduct.description,
      fullDescription: sourceProduct.fullDescription,
      contents: sourceProduct.contents,
      highlights: sourceProduct.highlights,
      features: sourceProduct.features,
      image: sourceProduct.image,
      galleryImages: sourceProduct.galleryImages,
      categoryName: sourceProduct.categoryName,
      status: 'DRAFT',
      isFeatured: false,
      stock: sourceProduct.stock,
      sku: `SKU-COPY-${Date.now()}`,
      weight: sourceProduct.weight,
      deliveryCharge: sourceProduct.deliveryCharge
    });

    const savedClone = await clonedProduct.save();
    res.status(201).json(savedClone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin Delete Product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product box tier removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct
};
