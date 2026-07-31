const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  searchProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('Administrador'), createProduct);

router.get('/buscar', protect, searchProducts);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('Administrador'), updateProduct);

router.patch('/:id/status', protect, toggleProductStatus);

module.exports = router;
