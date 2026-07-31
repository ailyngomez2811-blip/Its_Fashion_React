const mongoose = require('mongoose');

const ReturnItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true }
});

const ReturnSchema = new mongoose.Schema({
  venta: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  fecha: { type: Date, default: Date.now },
  motivo: { type: String, required: true },
  total_devolucion: { type: Number, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Quien solicita
  estado: { type: String, enum: ['Pendiente', 'Aceptada', 'Rechazada'], default: 'Pendiente' },
  fecha_resolucion: { type: Date },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Quien aprueba/rechaza
  detalles: [ReturnItemSchema]
});

module.exports = mongoose.model('Return', ReturnSchema);
