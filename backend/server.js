const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Definición de Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/cash-registers', require('./routes/cashRegisterRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Servidor de API de Its Fashion en ejecución...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});
