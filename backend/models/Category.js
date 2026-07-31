const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String }
});

module.exports = mongoose.model('Category', CategorySchema);
