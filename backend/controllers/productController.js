const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');

// Registrar movimiento en el historial de inventario
const registrarMovimientoInventario = async (id_producto, tipo_movimiento, stock_resultante, cantidad_movida) => {
  try {
    await InventoryHistory.create({
      producto: id_producto,
      tipo_movimiento,
      stock_disponible: stock_resultante,
      cantidad: Math.abs(cantidad_movida),
      concepto: tipo_movimiento === 'Entrada' ? 'Ajuste de Entrada / Registro' : 'Ajuste de Salida'
    });
  } catch (error) {
    console.error('Error al registrar movimiento de inventario:', error.message);
  }
};

// @desc    Listar todos los productos
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('categoria', 'nombre');
    res.json(products);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria', 'nombre');
    if (!product) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear un producto (Solo Administrador)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const {
    nombre,
    descripcion,
    precio_venta,
    precio_compra,
    stock,
    stock_minimo,
    talla,
    color,
    estado,
    id_categoria
  } = req.body;

  try {
    // Validar campos obligatorios
    if (!nombre || !talla || !color || !id_categoria || precio_venta === undefined || precio_compra === undefined || stock === undefined) {
      return res.status(400).json({ ok: false, msg: 'Completa todos los campos obligatorios' });
    }

    // Validar valores positivos mayores a cero
    if (precio_venta <= 0 || precio_compra <= 0) {
      return res.status(400).json({ ok: false, msg: 'Los precios deben ser valores numéricos positivos mayores a cero' });
    }

    // Validar stock no negativo
    if (stock < 0 || (stock_minimo !== undefined && stock_minimo < 0)) {
      return res.status(400).json({ ok: false, msg: 'El stock y stock mínimo no pueden ser negativos' });
    }

    // Validar que venta sea mayor a compra
    if (precio_venta <= precio_compra) {
      return res.status(400).json({ ok: false, msg: 'El precio de venta debe ser mayor al precio de compra' });
    }

    const product = new Product({
      nombre,
      descripcion,
      precio_venta,
      precio_compra,
      stock,
      stock_minimo: stock_minimo || 0,
      talla,
      color,
      estado: estado || 'Activo',
      categoria: id_categoria
    });

    const savedProduct = await product.save();

    // Registrar el stock inicial como Entrada
    if (savedProduct.stock > 0) {
      await registrarMovimientoInventario(savedProduct._id, 'Entrada', savedProduct.stock, savedProduct.stock);
    }

    res.status(201).json({ ok: true, msg: 'Producto creado correctamente', product: savedProduct });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Editar un producto (Solo Administrador)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    nombre,
    descripcion,
    precio_venta,
    precio_compra,
    stock,
    stock_minimo,
    talla,
    color,
    estado,
    id_categoria
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }

    // Validaciones de negocio identicas al PHP
    if (!nombre || !talla || !color || !id_categoria || precio_venta === undefined || precio_compra === undefined || stock === undefined) {
      return res.status(400).json({ ok: false, msg: 'Datos inválidos o incompletos' });
    }

    if (precio_venta <= 0 || precio_compra <= 0) {
      return res.status(400).json({ ok: false, msg: 'Los precios deben ser valores numéricos positivos mayores a cero' });
    }

    if (stock < 0 || (stock_minimo !== undefined && stock_minimo < 0)) {
      return res.status(400).json({ ok: false, msg: 'El stock y stock mínimo no pueden ser negativos' });
    }

    if (precio_venta <= precio_compra) {
      return res.status(400).json({ ok: false, msg: 'El precio de venta debe ser mayor al precio de compra' });
    }

    const oldStock = product.stock;
    const diff = stock - oldStock;

    product.nombre = nombre;
    product.descripcion = descripcion;
    product.precio_venta = precio_venta;
    product.precio_compra = precio_compra;
    product.stock = stock;
    product.stock_minimo = stock_minimo || 0;
    product.talla = talla;
    product.color = color;
    product.estado = estado || product.estado;
    product.categoria = id_categoria;

    const updatedProduct = await product.save();

    // Si cambio el stock, registrar el movimiento en Kardex
    if (diff !== 0) {
      const tipo = diff > 0 ? 'Entrada' : 'Salida';
      await registrarMovimientoInventario(updatedProduct._id, tipo, updatedProduct.stock, diff);
    }

    res.json({ ok: true, msg: 'Producto actualizado', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Habilitar/Deshabilitar un producto
// @route   PATCH /api/products/:id/status
// @access  Private
const toggleProductStatus = async (req, res) => {
  const { estado } = req.body;

  try {
    if (!['Activo', 'Inactivo'].includes(estado)) {
      return res.status(400).json({ ok: false, msg: 'Datos inválidos' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }

    product.estado = estado;
    await product.save();

    res.json({ ok: true, estado: product.estado });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Buscar productos
// @route   GET /api/products/search/query
// @access  Private
const searchProducts = async (req, res) => {
  const q = req.query.q || '';
  try {
    const query = q ? {
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { color: { $regex: q, $options: 'i' } },
        { talla: { $regex: q, $options: 'i' } }
      ]
    } : {};

    const products = await Product.find(query).populate('categoria', 'nombre');
    res.json(products);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener historial de Kárdex (Movimientos de Inventario)
// @route   GET /api/products/kardex
// @access  Private
const getKardex = async (req, res) => {
  try {
    const history = await InventoryHistory.find({})
      .populate('producto', 'nombre talla color')
      .populate('usuario', 'nombre apellido')
      .sort({ fecha: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Ajustar stock manualmente
// @route   POST /api/products/:id/adjust
// @access  Private/Admin
const adjustStock = async (req, res) => {
  const { tipo_movimiento, cantidad, concepto } = req.body;
  const qty = parseInt(cantidad);

  if (!tipo_movimiento || isNaN(qty) || qty <= 0 || !concepto) {
    return res.status(400).json({ ok: false, msg: 'Completa todos los campos con valores válidos' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }

    if (tipo_movimiento === 'Salida' && product.stock < qty) {
      return res.status(400).json({ ok: false, msg: `Stock insuficiente para realizar el ajuste. Stock actual: ${product.stock}` });
    }

    // Actualizar stock
    if (tipo_movimiento === 'Entrada') {
      product.stock += qty;
    } else {
      product.stock -= qty;
    }

    await product.save();

    // Registrar en Kardex
    await InventoryHistory.create({
      producto: product._id,
      tipo_movimiento,
      cantidad: qty,
      stock_disponible: product.stock,
      concepto: concepto.trim(),
      usuario: req.user._id // Usuario que registra el ajuste
    });

    res.json({ ok: true, msg: 'Ajuste de inventario realizado correctamente', stock: product.stock });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  searchProducts,
  getKardex,
  adjustStock
};
