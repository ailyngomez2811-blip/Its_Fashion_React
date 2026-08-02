const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
    const isSelf = req.user._id.toString() === req.params.id;
    if (req.user.rol !== 'Administrador' && !isSelf) {
      return res.status(403).json({ ok: false, msg: 'No tienes autorización para realizar esta acción' });
    }

    const user = await User.findById(req.params.id);

    if (user) {
      user.nombre = req.body.nombre || user.nombre;
      user.apellido = req.body.apellido || user.apellido;
      user.telefono = req.body.telefono || user.telefono;
      user.email = req.body.email || user.email;

      // Solo administrador puede cambiar el rol y el estado
      if (req.user.rol === 'Administrador') {
        user.rol = req.body.rol || user.rol;
        user.estado = req.body.estado || user.estado;
      }
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

// Actualizar perfil del usuario autenticado (Cliente/Empleado/Admin)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.nombre = req.body.nombre || user.nombre;
      user.apellido = req.body.apellido || user.apellido;
      user.email = req.body.email || user.email;
      user.telefono = req.body.telefono || user.telefono;

      const updatedUser = await user.save();
      res.json({
        ok: true,
        _id: updatedUser._id,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        username: updatedUser.username,
        email: updatedUser.email,
        rol: updatedUser.rol,
        telefono: updatedUser.telefono,
        estado: updatedUser.estado
      });
    } else {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Actualizar contraseña del usuario autenticado
const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ ok: false, msg: 'La contraseña actual es incorrecta' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ ok: true, msg: 'Contraseña actualizada correctamente' });
    } else {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Solicitar recuperación de contraseña (Gmail SMTP real)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, msg: 'No existe una cuenta registrada con este correo electrónico' });
    }

    // Generar un código numérico aleatorio de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const mailOptions = {
      from: `"Its Fashion" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperación de Contraseña - Its Fashion',
      html: `
        <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
          <h2 style="color: #0f172a; text-align: center; font-family: serif; margin-bottom: 20px;">Its Fashion</h2>
          <p style="color: #334155; font-size: 14px;">Hola <strong>${user.nombre}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Has solicitado restablecer tu contraseña. Copia y pega el siguiente código de seguridad en la pantalla de recuperación del sistema:</p>
          <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 15px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 6px; color: #2563eb; margin: 25px 0;">
            ${token}
          </div>
          <p style="color: #64748b; font-size: 12px;">Este código es de un único uso y expirará en 1 hora por motivos de seguridad.</p>
          <p style="color: #64748b; font-size: 12px;">Si no has solicitado este restablecimiento, puedes ignorar este correo tranquilamente.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Its Fashion &copy; 2026 — Sistema de Gestión y Facturación Boutique</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      ok: true, 
      msg: 'Hemos enviado un código de recuperación a tu bandeja de entrada'
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// Restablecer contraseña con token real
const resetPassword = async (req, res) => {
  const { email, password, token } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ ok: false, msg: 'El código de seguridad ingresado no es válido o ha expirado' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ ok: true, msg: 'Tu contraseña ha sido restablecida correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  updateUser,
  updateUserProfile,
  updateUserPassword,
  forgotPassword,
  resetPassword
};
