const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Crear una categoría (Solo Admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    if (!nombre) {
      return res.status(400).json({ ok: false, msg: 'El nombre es obligatorio' });
    }

    const nameExists = await Category.findOne({ nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } });
    if (nameExists) {
      return res.status(400).json({ ok: false, msg: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.create({ nombre: nombre.trim(), descripcion: descripcion?.trim() });
    res.status(201).json({ ok: true, msg: 'Categoría creada correctamente', category });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Editar una categoría (Solo Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    if (!nombre) {
      return res.status(400).json({ ok: false, msg: 'Datos inválidos' });
    }

    // Verificar si existe otra categoría con el mismo nombre
    const nameExists = await Category.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
      _id: { $ne: req.params.id }
    });

    if (nameExists) {
      return res.status(400).json({ ok: false, msg: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
    }

    category.nombre = nombre.trim();
    category.descripcion = descripcion?.trim() || '';
    await category.save();

    res.json({ ok: true, msg: 'Categoría actualizada', category });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Eliminar una categoría (Solo Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    // Validar si tiene productos asociados
    const hasProducts = await Product.findOne({ categoria: req.params.id });
    if (hasProducts) {
      return res.status(400).json({ ok: false, msg: 'No se puede eliminar: tiene productos asociados' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
    }

    res.json({ ok: true, msg: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
