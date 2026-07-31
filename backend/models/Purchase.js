const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const PurchaseSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  detalles: [PurchaseItemSchema]
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
