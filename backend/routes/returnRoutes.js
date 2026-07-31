const express = require('express');
const router = express.Router();
const {
  getReturns,
  getReturnById,
  createReturn,
  approveReturn,
  rejectReturn
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getReturns)
  .post(protect, createReturn);

router.route('/:id')
  .get(protect, getReturnById);

router.post('/:id/approve', protect, authorize('Administrador'), approveReturn);
router.post('/:id/reject', protect, authorize('Administrador'), rejectReturn);

module.exports = router;
