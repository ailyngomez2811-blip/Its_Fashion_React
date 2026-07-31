const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  updateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// Rutas de administración de usuarios (Solo Administrador)
router.route('/users')
  .get(protect, authorize('Administrador'), getUsers);

router.route('/users/:id')
  .put(protect, authorize('Administrador'), updateUser);

module.exports = router;
