const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  updateUser,
  updateUserPassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rutas de administración de usuarios (Solo Administrador)
router.route('/users')
  .get(protect, authorize('Administrador'), getUsers);

// Permite a administrador editar a todos, y a usuarios editarse a sí mismos (autorizado en el controlador)
router.route('/users/:id')
  .put(protect, updateUser);

// Actualizar contraseña de usuario
router.route('/users/:id/password')
  .put(protect, updateUserPassword);

module.exports = router;
