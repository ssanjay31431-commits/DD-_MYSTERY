const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductImage,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/:id/image', getProductImage);
router.get('/:id/image/content/:itemId', getProductImage);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.post('/:id/duplicate', protect, admin, duplicateProduct);

module.exports = router;
