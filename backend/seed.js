const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/its-fashion');
    console.log('Conectado a MongoDB para sembrar el usuario...');

    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('El usuario "admin" ya existe en la base de datos.');
      process.exit(0);
    }

    const admin = new User({
      nombre: 'Administrador',
      apellido: 'Fashion',
      username: 'admin',
      email: 'admin@itsfashion.com',
      password: 'admin', // Se encriptará automáticamente gracias a pre-save en User.js
      telefono: '123456789',
      rol: 'Administrador',
      estado: 'Activo'
    });

    await admin.save();
    console.log('¡Usuario Administrador creado exitosamente!');
    console.log('Credenciales de prueba:');
    console.log('- Usuario: admin');
    console.log('- Contraseña: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error.message);
    process.exit(1);
  }
};

seedAdmin();
