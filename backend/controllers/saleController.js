const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashRegister = require('../models/CashRegister');
const InventoryHistory = require('../models/InventoryHistory');
const User = require('../models/User');

// @desc    Obtener todas las ventas
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .populate('cliente', 'nombre apellido email')
      .populate('usuario', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color')
      .sort({ fecha: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener detalle de una venta
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cliente', 'nombre apellido email')
      .populate('usuario', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color');

    if (!sale) {
      return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear venta (Registro completo con transacción lógica)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  const { metodo_pago, id_cliente, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ ok: false, msg: 'Agrega al menos un producto' });
  }

  if (!['Efectivo', 'Transferencia bancaria'].includes(metodo_pago)) {
    return res.status(400).json({ ok: false, msg: 'Método de pago inválido' });
  }

  // Si es en efectivo, requiere caja abierta
  const activeRegister = await CashRegister.findOne({ estado: 'Abierta' });
  if (metodo_pago === 'Efectivo' && !activeRegister) {
    return res.status(400).json({ ok: false, msg: 'Debes abrir la caja antes de registrar ventas en efectivo' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let total = 0;
    const details = [];

    // Validar stock de todos los productos primero
    for (const item of items) {
      const product = await Product.findById(item.id_producto).session(session);
      if (!product || product.estado !== 'Activo') {
        throw new Error(`El producto ${item.nombre || item.id_producto} no está activo o no existe`);
      }
      if (product.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ${product.nombre}`);
      }

      const subtotal = item.cantidad * product.precio_venta;
      total += subtotal;

      details.push({
        producto: product._id,
        cantidad: item.cantidad,
        precio_unitario: product.precio_venta
      });

      // Descontar stock
      product.stock -= item.cantidad;
      await product.save({ session });

      // Registrar movimiento de inventario (Kardex)
      await InventoryHistory.create([{
        producto: product._id,
        stock_disponible: product.stock,
        cantidad: item.cantidad,
        tipo_movimiento: 'Salida',
        concepto: `Venta registrada`
      }], { session });
    }

    // Crear la venta
    const newSale = new Sale({
      total,
      cliente: id_cliente || null,
      metodo_pago,
      estado: 'Completada',
      usuario: req.user._id, // Vendedor actual
      detalles: details
    });

    const savedSale = await newSale.save({ session });

    // Si hay una caja abierta (para Efectivo o Transferencia), registrar el movimiento
    if (activeRegister) {
      activeRegister.movimientos.push({
        tipo: 'Ingreso',
        monto: total,
        concepto: `Venta #${savedSale._id.toString().substring(18)} (${metodo_pago})`,
        fecha: Date.now()
      });
      activeRegister.total_ingresos += total;
      await activeRegister.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ ok: true, msg: 'Venta registrada correctamente', id_venta: savedSale._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ ok: false, msg: error.message });
  }
};

// @desc    Buscar cliente por coincidencia
// @route   GET /api/sales/search/client
// @access  Private
const searchClient = async (req, res) => {
  const q = req.query.q || '';
  try {
    const clients = await User.find({
      rol: 'Cliente',
      estado: 'Activo',
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { apellido: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('nombre apellido email _id');

    res.json(clients);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  searchClient
};
