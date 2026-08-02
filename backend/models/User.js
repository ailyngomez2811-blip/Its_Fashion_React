const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['Administrador', 'Empleado', 'Cliente'], default: 'Cliente' },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  fecha_registro: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

// Encriptar password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
