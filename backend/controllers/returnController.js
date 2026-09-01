const mongoose = require('mongoose');
const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashRegister = require('../models/CashRegister');
const InventoryHistory = require('../models/InventoryHistory');

// @desc    Obtener todas las devoluciones
// @route   GET /api/returns
// @access  Private
const getReturns = async (req, res) => {
  try {
    const returns = await Return.find({})
      .populate('venta', '_id metodo_pago cliente')
      .populate('usuario', 'nombre apellido')
      .populate('admin', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color')
      .sort({ fecha: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener detalle de devolución
// @route   GET /api/returns/:id
// @access  Private
const getReturnById = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id)
      .populate('venta', '_id metodo_pago cliente')
      .populate('usuario', 'nombre apellido')
      .populate('admin', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color');

    if (!ret) {
      return res.status(404).json({ ok: false, msg: 'Devolución no encontrada' });
    }
    res.json(ret);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear solicitud de devolución (Pendiente por defecto)
// @route   POST /api/returns
// @access  Private
const createReturn = async (req, res) => {
  const { id_venta, motivo } = req.body;
  const items = req.body.items || req.body.productos || req.body.detalles;

  if (!id_venta || !motivo || !items || items.length === 0) {
    return res.status(400).json({ ok: false, msg: 'Datos incompletos' });
  }

  try {
    const sale = await Sale.findById(id_venta);
    if (!sale) {
      return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
    }

    if (sale.estado !== 'Completada') {
      return res.status(400).json({ ok: false, msg: 'Solo se pueden devolver ventas completadas' });
    }

    // Validar cantidades contra la venta original y extraer precios
    const originalSaleItems = {};
    const originalPriceMap = {};
    for (const det of sale.detalles) {
      const pId = det.producto.toString();
      originalSaleItems[pId] = det.cantidad;
      originalPriceMap[pId] = det.precio_unitario;
    }

    for (const item of items) {
      const pIdStr = (item.id_producto || item.producto).toString();
      if (!originalSaleItems[pIdStr] || item.cantidad > originalSaleItems[pIdStr]) {
        return res.status(400).json({ ok: false, msg: 'Cantidad supera lo comprado en la venta original' });
      }
    }

    let total_devolucion = 0;
    const details = [];

    for (const item of items) {
      const pIdStr = (item.id_producto || item.producto).toString();
      const precioUnit = item.precio_unitario || originalPriceMap[pIdStr] || 0;
      total_devolucion += item.cantidad * precioUnit;
      details.push({
        producto: pIdStr,
        cantidad: item.cantidad,
        precio_unitario: precioUnit
      });
    }

    const newReturn = await Return.create({
      venta: id_venta,
      motivo,
      total_devolucion,
      usuario: req.user._id, // Quien solicita
      estado: 'Pendiente',
      detalles: details
    });

    res.status(201).json({ ok: true, msg: 'Devolución registrada correctamente', id_devolucion: newReturn._id });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Aprobar devolución (Solo Admin)
// @route   POST /api/returns/:id/approve
// @access  Private/Admin
const approveReturn = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id);
    if (!ret || ret.estado !== 'Pendiente') {
      return res.status(400).json({ ok: false, msg: 'No se pudo aceptar (ya fue procesada o no existe)' });
    }

    // Cambiar estado a Aceptada
    ret.estado = 'Aceptada';
    ret.fecha_resolucion = Date.now();
    ret.admin = req.user._id;

    // Devolver stock y registrar movimiento Kardex
    for (const item of ret.detalles) {
      const product = await Product.findById(item.producto);
      if (product) {
        product.stock += item.cantidad;
        await product.save();

        // Kardex log Entrada
        await InventoryHistory.create({
          producto: product._id,
          stock_disponible: product.stock,
          cantidad: item.cantidad,
          tipo_movimiento: 'Entrada',
          concepto: `Devolución aceptada #${ret._id.toString().substring(18)}`
        });
      }
    }

    // Registrar egreso en caja si hay una abierta
    const activeRegister = await CashRegister.findOne({ estado: 'Abierta' });
    if (activeRegister) {
      const sale = await Sale.findById(ret.venta);
      const metodo = sale ? sale.metodo_pago : 'Indeterminado';

      activeRegister.movimientos.push({
        tipo: 'Egreso',
        monto: ret.total_devolucion,
        concepto: `Devolución #${ret._id.toString().substring(18)} (${metodo})`,
        fecha: Date.now()
      });
      activeRegister.total_egresos += ret.total_devolucion;
      await activeRegister.save();
    }

    await ret.save();

    res.json({ ok: true, msg: 'Devolución aceptada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Rechazar devolución (Solo Admin)
// @route   POST /api/returns/:id/reject
// @access  Private/Admin
const rejectReturn = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id);
    if (!ret || ret.estado !== 'Pendiente') {
      return res.status(400).json({ ok: false, msg: 'No se pudo rechazar (ya fue procesada o no existe)' });
    }

    ret.estado = 'Rechazada';
    ret.fecha_resolucion = Date.now();
    ret.admin = req.user._id;

    await ret.save();
    res.json({ ok: true, msg: 'Devolución rechazada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getReturns,
  getReturnById,
  createReturn,
  approveReturn,
  rejectReturn
};
