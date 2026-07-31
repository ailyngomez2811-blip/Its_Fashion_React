const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  searchClient
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.get('/buscar-cliente', protect, searchClient);

router.route('/:id')
  .get(protect, getSaleById);

module.exports = router;
