const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio_venta: { type: Number, required: true },
  precio_compra: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  stock_minimo: { type: Number, default: 0 },
  talla: { type: String, required: true },
  color: { type: String, required: true },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Product', ProductSchema);
