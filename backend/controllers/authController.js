const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar JWT para la autenticación de sesión
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforitsfashionproject123!', {
    expiresIn: '30d',
  });
};

// Registrar nuevo usuario
const registerUser = async (req, res) => {
  const { nombre, apellido, username, telefono, password, email, rol } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ ok: false, msg: 'El usuario o el correo ya están registrados' });
    }

    const user = await User.create({
      nombre,
      apellido,
      username,
      telefono,
      password,
      email,
      rol: rol || 'Cliente'
    });

    if (user) {
      res.status(201).json({
        ok: true,
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ ok: false, msg: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Autenticar usuario y obtener token (Login)
const authUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al usuario por nombre de usuario o por correo electrónico
    const user = await User.findOne({ 
      $or: [
        { username: username }, 
        { email: username }
      ] 
    });

    if (user && (await user.matchPassword(password))) {
      if (user.estado === 'Inactivo') {
        return res.status(403).json({ ok: false, msg: 'Tu cuenta está inactiva. Contacta al administrador.' });
      }

      res.json({
        ok: true,
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ ok: false, msg: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Obtener perfil del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        ok: true,
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono,
        estado: user.estado,
      });
    } else {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Obtener todos los usuarios (para vista de administración)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Actualizar datos de usuario / cambiar estado (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.nombre = req.body.nombre || user.nombre;
      user.apellido = req.body.apellido || user.apellido;
      user.telefono = req.body.telefono || user.telefono;
      user.rol = req.body.rol || user.rol;
      user.estado = req.body.estado || user.estado;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        ok: true,
        _id: updatedUser._id,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        username: updatedUser.username,
        email: updatedUser.email,
        rol: updatedUser.rol,
        estado: updatedUser.estado
      });
    } else {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  updateUser
};
