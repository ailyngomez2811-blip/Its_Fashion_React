const CashRegister = require('../models/CashRegister');

// @desc    Obtener caja activa
// @route   GET /api/cash-registers/active
// @access  Private
const getActiveRegister = async (req, res) => {
  try {
    const active = await CashRegister.findOne({ estado: 'Abierta' }).populate('usuario', 'nombre apellido');
    res.json({ ok: true, active });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Abrir caja
// @route   POST /api/cash-registers/open
// @access  Private
const openRegister = async (req, res) => {
  const { saldo_inicial } = req.body;

  try {
    if (saldo_inicial === undefined || saldo_inicial < 0) {
      return res.status(400).json({ ok: false, msg: 'El saldo inicial no puede ser negativo' });
    }

    // Verificar que no haya otra caja abierta
    const alreadyOpen = await CashRegister.findOne({ estado: 'Abierta' });
    if (alreadyOpen) {
      return res.status(400).json({ ok: false, msg: 'Ya existe una caja abierta.' });
    }

    const newRegister = await CashRegister.create({
      saldo_inicial,
      usuario: req.user._id,
      estado: 'Abierta'
    });

    res.status(201).json({ ok: true, msg: 'Caja abierta correctamente', active: newRegister });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Cerrar caja
// @route   POST /api/cash-registers/close
// @access  Private
const closeRegister = async (req, res) => {
  const { id_caja, saldo_final, justificacion } = req.body;

  try {
    if (!id_caja) {
      return res.status(400).json({ ok: false, msg: 'Caja inválida' });
    }

    const register = await CashRegister.findById(id_caja);
    if (!register) {
      return res.status(404).json({ ok: false, msg: 'Caja no encontrada.' });
    }

    if (register.estado === 'Cerrada') {
      return res.status(400).json({ ok: false, msg: 'Esta caja ya se encuentra cerrada.' });
    }

    const saldo_teorico = register.saldo_inicial + register.total_ingresos - register.total_egresos;
    const diferencia = (saldo_final || 0) - saldo_teorico;

    // Si hay diferencia, es obligatoria la justificación
    if (diferencia !== 0 && (!justificacion || !justificacion.trim())) {
      return res.status(400).json({ ok: false, msg: 'La justificación es obligatoria cuando hay diferencia.' });
    }

    register.saldo_final = saldo_final || 0;
    register.diferencia = diferencia;
    register.justificacion = justificacion || '';
    register.fecha_cierre = Date.now();
    register.estado = 'Cerrada';

    await register.save();

    res.json({ ok: true, msg: 'Caja cerrada correctamente', register });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Registrar movimiento en caja
// @route   POST /api/cash-registers/movement
// @access  Private
const createMovement = async (req, res) => {
  const { id_caja, tipo, monto, concepto } = req.body;

  try {
    if (!id_caja || !['Ingreso', 'Egreso'].includes(tipo) || monto === undefined || monto <= 0 || !concepto) {
      return res.status(400).json({ ok: false, msg: 'Completa todos los campos correctamente' });
    }

    const register = await CashRegister.findById(id_caja);
    if (!register) {
      return res.status(404).json({ ok: false, msg: 'Caja no encontrada.' });
    }

    if (register.estado === 'Cerrada') {
      return res.status(400).json({ ok: false, msg: 'No se pueden registrar movimientos en una caja cerrada.' });
    }

    // Registrar el movimiento en el arreglo embebido
    register.movimientos.push({
      tipo,
      monto,
      concepto,
      fecha: Date.now()
    });

    // Actualizar totales de la caja
    if (tipo === 'Ingreso') {
      register.total_ingresos += monto;
    } else {
      register.total_egresos += monto;
    }

    await register.save();

    res.json({ ok: true, msg: 'Movimiento registrado', register });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener historial de cajas abiertas/cerradas
// @route   GET /api/cash-registers/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await CashRegister.find({})
      .populate('usuario', 'nombre apellido')
      .sort({ fecha_apertura: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener saldo teórico de una caja
// @route   GET /api/cash-registers/:id/balance
// @access  Private
const getBalance = async (req, res) => {
  try {
    const register = await CashRegister.findById(req.params.id);
    if (!register) {
      return res.status(404).json({ ok: false, msg: 'Caja no encontrada' });
    }
    const saldo_teorico = register.saldo_inicial + register.total_ingresos - register.total_egresos;
    res.json({ saldo: saldo_teorico });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getActiveRegister,
  openRegister,
  closeRegister,
  createMovement,
  getHistory,
  getBalance
};
