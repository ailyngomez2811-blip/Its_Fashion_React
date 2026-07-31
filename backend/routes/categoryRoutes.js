const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('Administrador'), createCategory);

router.route('/:id')
  .put(protect, authorize('Administrador'), updateCategory)
  .delete(protect, authorize('Administrador'), deleteCategory);

module.exports = router;
