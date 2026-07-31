const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  contacto: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String },
  direccion: { type: String },
  documento: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
