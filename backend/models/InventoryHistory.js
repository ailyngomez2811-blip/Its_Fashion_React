const mongoose = require('mongoose');

const InventoryHistorySchema = new mongoose.Schema({
  fecha_registro: { type: Date, default: Date.now },
  stock_disponible: { type: Number, required: true }, // Stock resultante despues del movimiento
  cantidad: { type: Number, required: true }, // Cantidad que entro o salio (positiva/negativa)
  tipo_movimiento: { type: String, enum: ['Entrada', 'Salida', 'Ajuste'], required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  concepto: { type: String }, // Ej: "Venta #123", "Compra #456", "Ajuste de inventario"
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('InventoryHistory', InventoryHistorySchema);
