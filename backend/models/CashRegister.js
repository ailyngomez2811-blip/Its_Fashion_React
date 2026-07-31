const mongoose = require('mongoose');

const CashMovementSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['Ingreso', 'Egreso'], required: true },
  monto: { type: Number, required: true },
  concepto: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

const CashRegisterSchema = new mongoose.Schema({
  saldo_inicial: { type: Number, required: true },
  saldo_final: { type: Number },
  total_ingresos: { type: Number, default: 0 },
  total_egresos: { type: Number, default: 0 },
  diferencia: { type: Number },
  justificacion: { type: String },
  fecha_apertura: { type: Date, default: Date.now },
  fecha_cierre: { type: Date },
  estado: { type: String, enum: ['Abierta', 'Cerrada'], default: 'Abierta' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movimientos: [CashMovementSchema]
});

module.exports = mongoose.model('CashRegister', CashRegisterSchema);
