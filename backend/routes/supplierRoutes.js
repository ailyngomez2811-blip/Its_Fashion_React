const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('Administrador'), createSupplier);

router.route('/:id')
  .put(protect, authorize('Administrador'), updateSupplier);

module.exports = router;
