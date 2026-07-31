const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true }
});

const SaleSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional, puede ser null o cliente registrado
  metodo_pago: { type: String, enum: ['Efectivo', 'Transferencia bancaria'], required: true },
  estado: { type: String, enum: ['Completada', 'Cancelada'], default: 'Completada' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Vendedor
  detalles: [SaleItemSchema]
});

module.exports = mongoose.model('Sale', SaleSchema);
