const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const InventoryHistory = require('./models/InventoryHistory');
const Category = require('./models/Category');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/its-fashion');
    console.log('MongoDB Conectado');
    const products = await Product.find({}).populate('categoria');
    const history = await InventoryHistory.find({}).populate('producto');
    console.log('PRODUCTS:', JSON.stringify(products, null, 2));
    console.log('HISTORY:', JSON.stringify(history, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
