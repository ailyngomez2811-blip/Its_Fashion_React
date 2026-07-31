const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token de la cabecera
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforitsfashionproject123!');

      // Obtener el usuario del token (excluyendo password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }

      if (req.user.estado === 'Inactivo') {
        return res.status(403).json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// Middleware para validar roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: `El rol (${req.user ? req.user.rol : 'ninguno'}) no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
