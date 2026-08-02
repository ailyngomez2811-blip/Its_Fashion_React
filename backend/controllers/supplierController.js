const Supplier = require('../models/Supplier');

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear un proveedor (Solo Admin)
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res) => {
  const { nombre, contacto, telefono, email, direccion, documento, estado } = req.body;

  try {
    if (!nombre || !documento) {
      return res.status(400).json({ ok: false, msg: 'Nombre y documento son obligatorios' });
    }

    const docExists = await Supplier.findOne({ documento: documento.trim() });
    if (docExists) {
      return res.status(400).json({ ok: false, msg: 'Ya existe un proveedor con ese documento' });
    }

    const supplier = await Supplier.create({
      nombre: nombre.trim(),
      contacto: contacto?.trim() || '',
      telefono: telefono?.trim() || '',
      email: email?.trim() || '',
      direccion: direccion?.trim() || '',
      documento: documento.trim(),
      estado: estado || 'Activo'
    });

    res.status(201).json({ ok: true, msg: 'Proveedor creado correctamente', supplier });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Editar un proveedor (Solo Admin)
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = async (req, res) => {
  const { nombre, contacto, telefono, email, direccion, documento, estado } = req.body;

  try {
    if (!nombre || !documento) {
      return res.status(400).json({ ok: false, msg: 'Datos inválidos' });
    }

    const docExists = await Supplier.findOne({ documento: documento.trim(), _id: { $ne: req.params.id } });
    if (docExists) {
      return res.status(400).json({ ok: false, msg: 'Ya existe un proveedor con ese documento' });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ ok: false, msg: 'Proveedor no encontrado' });
    }

    supplier.nombre = nombre.trim();
    supplier.contacto = contacto?.trim() || '';
    supplier.telefono = telefono?.trim() || '';
    supplier.email = email?.trim() || '';
    supplier.direccion = direccion?.trim() || '';
    supplier.documento = documento.trim();
    if (estado) {
      supplier.estado = estado;
    }

    await supplier.save();

    res.json({ ok: true, msg: 'Proveedor actualizado', supplier });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier
};
