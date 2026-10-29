const Product = require('../models/Product');
const mongoose = require('mongoose');
const sharp = require('sharp');
const PRODUCT_QUERY_MAX_TIME_MS = 5000;
const MAX_PRODUCT_PAGE_SIZE = 48;
const IMAGE_CHUNK_SIZE = 256 * 1024;
const MAX_IMAGE_SOURCE_SIZE = 12 * 1024 * 1024;
const PRODUCT_IMAGE_WIDTHS = new Set([320, 640, 960]);
const DEFAULT_PRODUCT_IMAGE_WIDTH = 640;
const PRODUCT_RESPONSE_FIELDS = [
  'name', 'slug', 'price', 'originalPrice', 'tag', 'tagline', 'description',
  'fullDescription', 'contents._id', 'contents.name', 'contents.description',
  'contents.quantity', 'contents.category', 'contents.isMystery', 'contents.sortOrder',
  'contents.active', 'highlights', 'features', 'categoryName', 'status',
  'isFeatured', 'stock', 'rating', 'numReviews', 'createdAt', 'updatedAt',
  'sku', 'weight', 'deliveryCharge', 'advanceAmount'
].join(' ');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getImageUrl = (req, productId, contentId) => {
  const contentPath = contentId ? `/content/${contentId}` : '';
  return `${req.protocol}://${req.get('host')}/api/products/${productId}/image${contentPath}`;
};

const serializeProduct = (product, req) => {
  const result = product.toObject ? product.toObject() : { ...product };
  result.image = getImageUrl(req, result._id);
  if (Array.isArray(result.contents)) {
    result.contents = result.contents.map((content) => ({
      ...content,
      image: getImageUrl(req, result._id, content._id)
    }));
  }
  return result;
};

const isProductImageReference = (value, productId, contentId) => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value, 'http://localhost');
    const path = `/api/products/${productId}/image${contentId ? `/content/${contentId}` : ''}`;
    return url.pathname === path;
  } catch {
    return false;
  }
};

const getImageExpression = (contentId) => {
  if (!contentId) return '$image';

  return {
    $let: {
      vars: {
        content: {
          $arrayElemAt: [
            {
              $filter: {
                input: { $ifNull: ['$contents', []] },
                as: 'item',
                cond: { $eq: ['$$item._id', new mongoose.Types.ObjectId(contentId)] }
              }
            },
            0
          ]
        }
      },
      in: { $ifNull: ['$$content.image', ''] }
    }
  };
};

const readImageChunk = async (productId, imageExpression, offset, length) => {
  const result = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    {
      $project: {
        chunk: {
          $substrBytes: [
            { $ifNull: [imageExpression, ''] },
            offset,
            length
          ]
        }
      }
    }
  ]).option({ maxTimeMS: PRODUCT_QUERY_MAX_TIME_MS });

  return result[0]?.chunk || '';
};

const getProductImage = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id) || (itemId && !/^[0-9a-fA-F]{24}$/.test(itemId))) {
      return res.status(404).json({ message: 'Product image not found' });
    }
    const width = req.query.width === undefined
      ? DEFAULT_PRODUCT_IMAGE_WIDTH
      : Number(req.query.width);
    if (!Number.isSafeInteger(width) || !PRODUCT_IMAGE_WIDTHS.has(width)) {
      return res.status(400).json({ message: 'Image width must be 320, 640, or 960' });
    }

    const imageExpression = getImageExpression(itemId);
    const fallbackExpression = { $ifNull: [imageExpression, ''] };
    const [metadata] = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          status: 1,
          sourceLength: { $strLenBytes: fallbackExpression },
          prefix: { $substrBytes: [fallbackExpression, 0, 64] }
        }
      }
    ]).option({ maxTimeMS: PRODUCT_QUERY_MAX_TIME_MS });

    if (!metadata || !metadata.sourceLength) {
      return res.status(404).json({ message: 'Product image not found' });
    }
    if (metadata.sourceLength > MAX_IMAGE_SOURCE_SIZE) {
      return res.status(413).json({ message: 'Product image exceeds the supported size' });
    }
    res.set({
      'Cache-Control': metadata.status === 'ACTIVE' ? 'public, max-age=300' : 'private, no-store',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff'
    });
    res.vary('Accept');

    const dataUriMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/.exec(metadata.prefix);
    if (!dataUriMatch) {
      if (metadata.sourceLength > 2048) {
        return res.status(415).json({ message: 'Unsupported product image format' });
      }
      const source = await readImageChunk(id, imageExpression, 0, metadata.sourceLength);
      let target;
      try {
        target = new URL(source);
      } catch {
        return res.status(415).json({ message: 'Unsupported product image format' });
      }
      if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) {
        return res.status(415).json({ message: 'Unsupported product image URL' });
      }
      return res.redirect(302, target.toString());
    }

    const encodedChunks = [];
    for (let offset = 0; offset < metadata.sourceLength; offset += IMAGE_CHUNK_SIZE * 4) {
      const offsets = [];
      for (let batchOffset = offset; batchOffset < metadata.sourceLength && batchOffset < offset + IMAGE_CHUNK_SIZE * 4; batchOffset += IMAGE_CHUNK_SIZE) {
        offsets.push(batchOffset);
      }
      const chunks = await Promise.all(offsets.map((chunkOffset) => readImageChunk(
        id,
        imageExpression,
        chunkOffset,
        Math.min(IMAGE_CHUNK_SIZE, metadata.sourceLength - chunkOffset)
      )));
      encodedChunks.push(...chunks);
    }

    const encodedImage = encodedChunks.join('').slice(dataUriMatch[0].length);
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encodedImage)) {
      return res.status(422).json({ message: 'Product image data is invalid' });
    }

    const imageBuffer = Buffer.from(encodedImage, 'base64');
    if (!imageBuffer.length) {
      return res.status(422).json({ message: 'Product image data is empty' });
    }

    const mimeType = dataUriMatch[1].toLowerCase();
    const acceptsWebp = (req.get('accept') || '').includes('image/webp');
    if (acceptsWebp && mimeType !== 'image/gif' && mimeType !== 'image/svg+xml') {
      try {
        const webpImage = await sharp(imageBuffer, { limitInputPixels: 40000000 })
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78, effort: 4 })
          .toBuffer();
        return res.type('image/webp').send(webpImage);
      } catch (error) {
        error.status = 422;
        error.message = 'Product image could not be optimized';
        return next(error);
      }
    }

    return res.type(mimeType).send(imageBuffer);
  } catch (error) {
    next(error);
  }
};

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
      .select(PRODUCT_RESPONSE_FIELDS)
      .maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS)
      .sort({ createdAt: -1, _id: -1 });

    if (hasPagination) {
      query = query.skip((page - 1) * limit).limit(limit + 1);
    }

    let products = await query.lean();
    products = products.map((product) => serializeProduct(product, req));

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
      product = await Product.findById(param)
        .select(PRODUCT_RESPONSE_FIELDS)
        .maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS)
        .lean();
    } else {
      product = await Product.findOne({ slug: param })
        .select(PRODUCT_RESPONSE_FIELDS)
        .maxTimeMS(PRODUCT_QUERY_MAX_TIME_MS)
        .lean();
    }

    if (product) {
      res.json(serializeProduct(product, req));
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
    res.status(201).json(serializeProduct(createdProduct, req));
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
      product.highlights = req.body.highlights || product.highlights;
      product.features = req.body.features || product.features;
      if (req.body.image && !isProductImageReference(req.body.image, product._id)) {
        product.image = req.body.image;
      }
      product.galleryImages = req.body.galleryImages || product.galleryImages;
      if (Array.isArray(req.body.contents)) {
        const existingContents = product.contents;
        product.contents = req.body.contents.map((content) => {
          const existingContent = content._id ? existingContents.id(content._id) : null;
          const image = existingContent && isProductImageReference(content.image, product._id, content._id)
            ? existingContent.image
            : content.image;
          return { ...content, image };
        });
      } else if (req.body.contents) {
        product.contents = req.body.contents;
      }
      product.categoryName = req.body.categoryName || product.categoryName;
      product.status = req.body.status || product.status;
      product.isFeatured = req.body.isFeatured ?? product.isFeatured;
      product.stock = req.body.stock ?? product.stock;
      product.sku = req.body.sku || product.sku;
      product.weight = req.body.weight || product.weight;
      product.deliveryCharge = req.body.deliveryCharge ?? product.deliveryCharge;

      const updatedProduct = await product.save();
      res.json(serializeProduct(updatedProduct, req));
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
    res.status(201).json(serializeProduct(savedClone, req));
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
  getProductImage,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct
};
