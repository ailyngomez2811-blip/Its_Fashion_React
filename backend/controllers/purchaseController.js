const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');

// @desc    Obtener todas las compras
// @route   GET /api/purchases
// @access  Private
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate('proveedor', 'nombre contacto documento')
      .populate('usuario', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color')
      .sort({ fecha: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener detalle de compra
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('proveedor', 'nombre contacto documento')
      .populate('usuario', 'nombre apellido')
      .populate('detalles.producto', 'nombre talla color');

    if (!purchase) {
      return res.status(404).json({ ok: false, msg: 'Compra no encontrada' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear compra a proveedor (aumenta stock)
// @route   POST /api/purchases
// @access  Private
const createPurchase = async (req, res) => {
  const { id_proveedor, items } = req.body;

  if (!id_proveedor) {
    return res.status(400).json({ ok: false, msg: 'Selecciona un proveedor' });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ ok: false, msg: 'Agrega al menos un producto' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let total = 0;
    const details = [];

    for (const item of items) {
      const product = await Product.findById(item.id_producto).session(session);
      if (!product) {
        throw new Error(`El producto con ID ${item.id_producto} no existe`);
      }

      const subtotal = item.cantidad * item.precio_unitario;
      total += subtotal;

      details.push({
        producto: product._id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal
      });

      // Aumentar stock del producto
      product.stock += item.cantidad;
      await product.save({ session });

      // Registrar movimiento de inventario (Kardex: Entrada)
      await InventoryHistory.create([{
        producto: product._id,
        stock_disponible: product.stock,
        cantidad: item.cantidad,
        tipo_movimiento: 'Entrada',
        concepto: 'Compra registrada'
      }], { session });
    }

    const newPurchase = new Purchase({
      total,
      proveedor: id_proveedor,
      usuario: req.user._id, // Quien registra la compra
      detalles: details
    });

    const savedPurchase = await newPurchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ ok: true, msg: 'Compra registrada correctamente', id_compra: savedPurchase._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase
};
