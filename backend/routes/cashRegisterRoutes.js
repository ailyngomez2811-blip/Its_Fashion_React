const express = require('express');
const router = express.Router();
const {
  getActiveRegister,
  openRegister,
  closeRegister,
  createMovement,
  getHistory,
  getBalance
} = require('../controllers/cashRegisterController');
const { protect } = require('../middleware/auth');

router.get('/active', protect, getActiveRegister);
router.post('/open', protect, openRegister);
router.post('/close', protect, closeRegister);
router.post('/movement', protect, createMovement);
router.get('/history', protect, getHistory);
router.get('/:id/balance', protect, getBalance);

module.exports = router;
