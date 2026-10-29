const Product = require('../models/Product');
const PRODUCT_QUERY_MAX_TIME_MS = 5000;
const MAX_PRODUCT_PAGE_SIZE = 48;
const PRODUCT_LIST_FIELDS = 'name slug price originalPrice tag tagline description contents image categoryName status isFeatured stock rating numReviews createdAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc Get all products (Filter ACTIVE for customer, All for admin)
// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { status, category, search, includeInactive } = req.query;
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const requestedLimit = req.query.limit === undefined ? 12 : Number(req.query.limit);

    if (hasPagination && (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1)) {
      return res.status(400).json({ message: 'Page and limit must be positive integers' });
    }
    const limit = Math.min(requestedLimit, MAX_PRODUCT_PAGE_SIZE);
    res.set('Cache-Control', 'no-store');

    let filter = {};

    if (includeInactive !== 'true' && req.user?.role !== 'admin') {
      filter.status = 'ACTIVE';
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categoryName = category;
    }

    if (typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tagline: searchRegex }
      ];
    }

    let query = Product.find(filter)
      .maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS)
      .sort({ createdAt: -1, _id: -1 });

    if (hasPagination) {
      if (includeInactive !== 'true') {
        query = query.select(PRODUCT_LIST_FIELDS);
      }
      query = query.skip((page - 1) * limit).limit(limit + 1);
    }

    let products = await query.lean();

    if (hasPagination) {
      const hasNext = products.length > limit;
      products = products.slice(0, limit);
      return res.json({ products, page, limit, hasNext });
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc Get product by ID or Slug
// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const param = req.params.id;
    res.set('Cache-Control', 'no-store');
    let product;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param).maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS).lean();
    } else {
      product = await Product.findOne({ slug: param }).maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS).lean();
    }

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product box tier not found' });
    }
  } catch (error) {
    next(error);
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
