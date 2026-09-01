const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const CashRegister = require('./models/CashRegister');
const Sale = require('./models/Sale');
const Purchase = require('./models/Purchase');
const Return = require('./models/Return');
const InventoryHistory = require('./models/InventoryHistory');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/its-fashion';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB...');

    // Limpiar colecciones anteriores para asegurar datos limpios y consistentes
    console.log('🧹 Limpiando colecciones anteriores...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      CashRegister.deleteMany({}),
      Sale.deleteMany({}),
      Purchase.deleteMany({}),
      Return.deleteMany({}),
      InventoryHistory.deleteMany({})
    ]);

    // Password hasheada común para todos los usuarios: '123456' y 'admin' para admin
    const defaultPasswordHash = await bcrypt.hash('123456', 10);
    const adminPasswordHash = await bcrypt.hash('admin', 10);

    // ==========================================
    // 1. USUARIOS (15 registros)
    // ==========================================
    console.log('👤 Insertando 15 Usuarios...');
    const usersData = [
      // Administradores (3)
      { nombre: 'Administrador', apellido: 'Principal', username: 'admin', email: 'admin@itsfashion.com', telefono: '3001112233', password: adminPasswordHash, rol: 'Administrador', estado: 'Activo' },
      { nombre: 'Carlos', apellido: 'Gómez', username: 'carlos_admin', email: 'carlos.admin@itsfashion.com', telefono: '3002223344', password: defaultPasswordHash, rol: 'Administrador', estado: 'Activo' },
      { nombre: 'Laura', apellido: 'Martínez', username: 'laura_admin', email: 'laura.admin@itsfashion.com', telefono: '3003334455', password: defaultPasswordHash, rol: 'Administrador', estado: 'Activo' },
      // Empleados (4)
      { nombre: 'Ailyn', apellido: 'Nicol', username: 'ailyn_emp', email: 'ailyn.emp@itsfashion.com', telefono: '3014445566', password: defaultPasswordHash, rol: 'Empleado', estado: 'Activo' },
      { nombre: 'Mateo', apellido: 'Rodríguez', username: 'mateo_emp', email: 'mateo.emp@itsfashion.com', telefono: '3015556677', password: defaultPasswordHash, rol: 'Empleado', estado: 'Activo' },
      { nombre: 'Valentina', apellido: 'Pérez', username: 'valentina_emp', email: 'valentina.emp@itsfashion.com', telefono: '3016667788', password: defaultPasswordHash, rol: 'Empleado', estado: 'Activo' },
      { nombre: 'Santiago', apellido: 'López', username: 'santiago_emp', email: 'santiago.emp@itsfashion.com', telefono: '3017778899', password: defaultPasswordHash, rol: 'Empleado', estado: 'Activo' },
      // Clientes (8)
      { nombre: 'Camila', apellido: 'Torres', username: 'camila_cliente', email: 'camila@gmail.com', telefono: '3101110001', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Daniel', apellido: 'Castro', username: 'daniel_cliente', email: 'daniel@gmail.com', telefono: '3101110002', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Mariana', apellido: 'Morales', username: 'mariana_cliente', email: 'mariana@gmail.com', telefono: '3101110003', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Alejandro', apellido: 'Vargas', username: 'alejandro_cliente', email: 'alejandro@gmail.com', telefono: '3101110004', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Sofía', apellido: 'Herrera', username: 'sofia_cliente', email: 'sofia@gmail.com', telefono: '3101110005', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Andrés', apellido: 'Navarro', username: 'andres_cliente', email: 'andres@gmail.com', telefono: '3101110006', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Paula', apellido: 'Ríos', username: 'paula_cliente', email: 'paula@gmail.com', telefono: '3101110007', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' },
      { nombre: 'Felipe', apellido: 'Gutiérrez', username: 'felipe_cliente', email: 'felipe@gmail.com', telefono: '3101110008', password: defaultPasswordHash, rol: 'Cliente', estado: 'Activo' }
    ];
    const insertedUsers = await User.insertMany(usersData);
    const adminUser = insertedUsers[0];
    const empUsers = insertedUsers.filter(u => u.rol === 'Empleado');
    const clientUsers = insertedUsers.filter(u => u.rol === 'Cliente');

    // ==========================================
    // 2. CATEGORÍAS (15 registros)
    // ==========================================
    console.log('🏷️ Insertando 15 Categorías...');
    const categoriesData = [
      { nombre: 'Blusas y Camisas', descripcion: 'Blusas de tela fría, lino y seda para dama' },
      { nombre: 'Pantalones y Jeans', descripcion: 'Jeans bota recta, skinny, palazzo y drill' },
      { nombre: 'Vestidos de Gala', descripcion: 'Vestidos largos, de noche y coctel' },
      { nombre: 'Faldas', descripcion: 'Faldas cortas, midi, plisadas y en denim' },
      { nombre: 'Chaquetas y Abrigos', descripcion: 'Chaquetas denim, blazers ejecutivos y gabanes' },
      { nombre: 'Ropa Deportiva', descripcion: 'Leggings, tops deportivos y sudaderas fitness' },
      { nombre: 'Calzado Femenino', descripcion: 'Tacones, plataformas, sandalias y botas' },
      { nombre: 'Accesorios y Bisutería', descripcion: 'Aretes, collares, cinturones y pulseras' },
      { nombre: 'Bolsos y Carteras', descripcion: 'Bolsos de mano, bandoleras y morrales de cuero sintético' },
      { nombre: 'Ropa Interior y Pijamas', descripcion: 'Conjuntos de lencería, pijamas de seda y batas' },
      { nombre: 'Camisetas Casuales', descripcion: 'Camisetas básicas de algodón, estampadas y crop tops' },
      { nombre: 'Enterizos y Monos', descripcion: 'Jumpsuits casuales y elegantes de una pieza' },
      { nombre: 'Shorts y Bermudas', descripcion: 'Shorts de mezclilla, lino y playeros' },
      { nombre: 'Ropa de Playa y Trajes de Baño', descripcion: 'Bikinis, enterizos de baño y salidas de baño' },
      { nombre: 'Suéteres y Cardigans', descripcion: 'Tejidos de lana suave, buzos y cardigans abiertos' }
    ];
    const insertedCategories = await Category.insertMany(categoriesData);

    // ==========================================
    // 3. PROVEEDORES (15 registros)
    // ==========================================
    console.log('🏭 Insertando 15 Proveedores...');
    const suppliersData = [
      { nombre: 'Textiles del Valle S.A.S', contacto: 'Guillermo Restrepo', telefono: '3151234501', email: 'ventas@textilesdelvalle.com', direccion: 'Calle 10 # 40-20, Cali', documento: '900100201-1', estado: 'Activo' },
      { nombre: 'Moda & Confecciones Colombia', contacto: 'Patricia Mendoza', telefono: '3151234502', email: 'contacto@modacolombia.com', direccion: 'Carrera 15 # 85-30, Bogotá', documento: '900100202-2', estado: 'Activo' },
      { nombre: 'Distribuidora Denim Caribe', contacto: 'Jorge Barón', telefono: '3151234503', email: 'pedidos@denimcaribe.com', direccion: 'Av. Circunvalar # 12-45, Barranquilla', documento: '900100203-3', estado: 'Activo' },
      { nombre: 'Industrias de Calzado Andino', contacto: 'Adriana Silva', telefono: '3151234504', email: 'info@calzadoandino.com', direccion: 'Calle 50 # 25-10, Bucaramanga', documento: '900100204-4', estado: 'Activo' },
      { nombre: 'Confecciones Antioquia Fashion', contacto: 'Federico Ochoa', telefono: '3151234505', email: 'ventas@antioquiafashion.com', direccion: 'Calle 33 # 65-18, Medellín', documento: '900100205-5', estado: 'Activo' },
      { nombre: 'Accesorios & Glamour Ltda', contacto: 'Viviana Hoyos', telefono: '3151234506', email: 'contacto@glamouraccesorios.com', direccion: 'Carrera 7 # 72-10, Bogotá', documento: '900100206-6', estado: 'Activo' },
      { nombre: 'Sedas y Lencería Imperial', contacto: 'Beatriz Salazar', telefono: '3151234507', email: 'gerencia@sedasimperial.com', direccion: 'Av. El Poblado # 10-35, Medellín', documento: '900100207-7', estado: 'Activo' },
      { nombre: 'Cueros & Diseños del Eje', contacto: 'Alonso Quintero', telefono: '3151234508', email: 'ventas@cueroseje.com', direccion: 'Carrera 22 # 18-04, Manizales', documento: '900100208-8', estado: 'Activo' },
      { nombre: 'SportWear Active Textiles', contacto: 'Clara Estrada', telefono: '3151234509', email: 'pedidos@sportwearactive.com', direccion: 'Calle 80 # 68-90, Bogotá', documento: '900100209-9', estado: 'Activo' },
      { nombre: 'Estampados & Telas de Oriente', contacto: 'Hernán Giraldo', telefono: '3151234510', email: 'telas@estampadosoriente.com', direccion: 'Carrera 5 # 14-22, Pereira', documento: '900100210-0', estado: 'Activo' },
      { nombre: 'Elegance Vestidos Import', contacto: 'Monica Cepeda', telefono: '3151234511', email: 'import@elegancevestidos.com', direccion: 'Calle 100 # 19-61, Bogotá', documento: '900100211-1', estado: 'Activo' },
      { nombre: 'Bikinis & Playa Tropical', contacto: 'Rosa Marín', telefono: '3151234512', email: 'ventas@playatropical.com', direccion: 'Bocagrande Av. San Martín # 6-40, Cartagena', documento: '900100212-2', estado: 'Activo' },
      { nombre: 'Punto y Lana Andina', contacto: 'Camilo Bustamante', telefono: '3151234513', email: 'lana@puntoyandina.com', direccion: 'Transversal 6 # 45-80, Pasto', documento: '900100213-3', estado: 'Activo' },
      { nombre: 'Comercializadora de Botones y Cierres', contacto: 'Luz Marina Duque', telefono: '3151234514', email: 'contacto@botonesycierres.com', direccion: 'Calle 12 # 9-40, Cali', documento: '900100214-4', estado: 'Activo' },
      { nombre: 'Bolsos Prestige Moda', contacto: 'Gabriel Naranjo', telefono: '3151234515', email: 'info@prestigebolsos.com', direccion: 'Carrera 43A # 1-50, Medellín', documento: '900100215-5', estado: 'Activo' }
    ];
    const insertedSuppliers = await Supplier.insertMany(suppliersData);

    // ==========================================
    // 4. PRODUCTOS (15 registros)
    // ==========================================
    console.log('👗 Insertando 15 Productos...');
    const productsData = [
      { nombre: 'Blusa de Seda Cuello V', descripcion: 'Blusa elegante en satín suave', precio_compra: 22000, precio_venta: 45000, stock: 35, stock_minimo: 8, talla: 'M', color: 'Rosa Pastel', categoria: insertedCategories[0]._id },
      { nombre: 'Jean Bota Campana High Rise', descripcion: 'Jean rígido tono azul medio con bota ancha', precio_compra: 45000, precio_venta: 89000, stock: 28, stock_minimo: 6, talla: '8', color: 'Azul Medio', categoria: insertedCategories[1]._id },
      { nombre: 'Vestido Largo Esmeralda de Gala', descripcion: 'Vestido con abertura en pierna para ocasiones especiales', precio_compra: 65000, precio_venta: 135000, stock: 15, stock_minimo: 4, talla: 'S', color: 'Verde Esmeralda', categoria: insertedCategories[2]._id },
      { nombre: 'Falda Midi Plisada', descripcion: 'Falda con pretina elástica y tela satinada', precio_compra: 25000, precio_venta: 52000, stock: 22, stock_minimo: 5, talla: 'M', color: 'Dorado Champán', categoria: insertedCategories[3]._id },
      { nombre: 'Blazer Ejecutivo Oversize', descripcion: 'Chaqueta formal forrada con solapas estructuradas', precio_compra: 55000, precio_venta: 110000, stock: 18, stock_minimo: 5, talla: 'L', color: 'Negro Azabache', categoria: insertedCategories[4]._id },
      { nombre: 'Set Deportivo Seamless (Top + Legging)', descripcion: 'Conjunto de compresión sin costuras para entrenamiento', precio_compra: 38000, precio_venta: 78000, stock: 30, stock_minimo: 8, talla: 'S', color: 'Lila Lavanda', categoria: insertedCategories[5]._id },
      { nombre: 'Tacones Stiletto Charol', descripcion: 'Calzado fino tacón 9cm con plantilla acolchada', precio_compra: 48000, precio_venta: 98000, stock: 14, stock_minimo: 4, talla: '37', color: 'Nude Beige', categoria: insertedCategories[6]._id },
      { nombre: 'Collar Doble Eslabón Baño de Oro', descripcion: 'Joyería fina en acero inoxidable con dije corazón', precio_compra: 12000, precio_venta: 28000, stock: 50, stock_minimo: 10, talla: 'Única', color: 'Dorado', categoria: insertedCategories[7]._id },
      { nombre: 'Bolso Tote Bag Cuero Vegano', descripcion: 'Cartera amplia con compartimento para laptop', precio_compra: 42000, precio_venta: 85000, stock: 20, stock_minimo: 5, talla: 'Grande', color: 'Café Miel', categoria: insertedCategories[8]._id },
      { nombre: 'Pijama Camisera en Seda', descripcion: 'Conjunto de short y camisa de manga corta', precio_compra: 28000, precio_venta: 58000, stock: 25, stock_minimo: 6, talla: 'M', color: 'Azul Marino', categoria: insertedCategories[9]._id },
      { nombre: 'Crop Top Ribbed Casual', descripcion: 'Camiseta acanalada de algodón elástico', precio_compra: 10000, precio_venta: 22000, stock: 45, stock_minimo: 10, talla: 'S', color: 'Blanco Nieve', categoria: insertedCategories[10]._id },
      { nombre: 'Enterizo Palazzo Elegante', descripcion: 'Mono enterizo de tiro alto con cinturón decorativo', precio_compra: 52000, precio_venta: 105000, stock: 16, stock_minimo: 4, talla: 'M', color: 'Rojo Carmesí', categoria: insertedCategories[11]._id },
      { nombre: 'Short Mom Fit Desflecado', descripcion: 'Short en mezclilla 100% algodón con ruedo rústico', precio_compra: 24000, precio_venta: 48000, stock: 32, stock_minimo: 6, talla: '10', color: 'Celeste Claro', categoria: insertedCategories[12]._id },
      { nombre: 'Traje de Baño Enterizo Asimétrico', descripcion: 'Bañador con control de abdomen y corte de un solo hombro', precio_compra: 32000, precio_venta: 68000, stock: 20, stock_minimo: 5, talla: 'M', color: 'Terracota', categoria: insertedCategories[13]._id },
      { nombre: 'Cardigan Tejido Oversize', descripcion: 'Suéter largo con botones carey y tejido grueso', precio_compra: 36000, precio_venta: 75000, stock: 19, stock_minimo: 5, talla: 'L', color: 'Beige Marfil', categoria: insertedCategories[14]._id }
    ];
    const insertedProducts = await Product.insertMany(productsData);

    // ==========================================
    // 5. CAJAS REGISTRADORAS (15 registros de turnos)
    // ==========================================
    console.log('💵 Insertando 15 Sesiones de Caja Registradora...');
    const cashRegistersData = [];
    const baseDate = new Date();
    
    // 14 cajas cerradas de días previos + 1 abierta actual
    for (let i = 14; i >= 0; i--) {
      const fecha = new Date(baseDate);
      fecha.setDate(baseDate.getDate() - i);
      const isCurrentOpen = (i === 0);
      const emp = empUsers[i % empUsers.length];

      cashRegistersData.push({
        saldo_inicial: 150000,
        saldo_final: isCurrentOpen ? null : 485000 + (i * 20000),
        total_ingresos: isCurrentOpen ? 120000 : 380000 + (i * 15000),
        total_egresos: isCurrentOpen ? 0 : 45000,
        diferencia: isCurrentOpen ? null : 0,
        justificacion: isCurrentOpen ? '' : 'Arqueo de caja cuadrado conforme a ventas del turno',
        fecha_apertura: fecha,
        fecha_cierre: isCurrentOpen ? null : new Date(fecha.getTime() + 8 * 60 * 60 * 1000),
        estado: isCurrentOpen ? 'Abierta' : 'Cerrada',
        usuario: emp._id,
        movimientos: [
          { tipo: 'Ingreso', monto: 150000, concepto: 'Base de apertura de caja', fecha: fecha },
          { tipo: 'Ingreso', monto: 98000, concepto: 'Venta #00' + (15 - i) + ' en efectivo', fecha: new Date(fecha.getTime() + 2 * 60 * 60 * 1000) },
          { tipo: 'Egreso', monto: isCurrentOpen ? 0 : 45000, concepto: isCurrentOpen ? 'Sin egreso' : 'Pago menor de flete y empaques', fecha: new Date(fecha.getTime() + 4 * 60 * 60 * 1000) }
        ]
      });
    }
    const insertedCashRegisters = await CashRegister.insertMany(cashRegistersData);
    const activeRegister = insertedCashRegisters.find(c => c.estado === 'Abierta');

    // ==========================================
    // 6. COMPRAS A PROVEEDORES (15 registros)
    // ==========================================
    console.log('📦 Insertando 15 Compras a Proveedores...');
    const purchasesData = [];
    for (let i = 0; i < 15; i++) {
      const fechaCompra = new Date(baseDate);
      fechaCompra.setDate(baseDate.getDate() - (20 - i));
      const prov = insertedSuppliers[i % insertedSuppliers.length];
      const prod1 = insertedProducts[i % insertedProducts.length];
      const prod2 = insertedProducts[(i + 1) % insertedProducts.length];
      const cant1 = 10 + i;
      const cant2 = 8 + i;
      const sub1 = cant1 * prod1.precio_compra;
      const sub2 = cant2 * prod2.precio_compra;

      purchasesData.push({
        fecha: fechaCompra,
        total: sub1 + sub2,
        proveedor: prov._id,
        usuario: adminUser._id,
        detalles: [
          { producto: prod1._id, cantidad: cant1, precio_unitario: prod1.precio_compra, subtotal: sub1 },
          { producto: prod2._id, cantidad: cant2, precio_unitario: prod2.precio_compra, subtotal: sub2 }
        ]
      });
    }
    const insertedPurchases = await Purchase.insertMany(purchasesData);

    // ==========================================
    // 7. VENTAS (15 registros)
    // ==========================================
    console.log('🛍️ Insertando 15 Ventas de Facturación...');
    const salesData = [];
    for (let i = 0; i < 15; i++) {
      const fechaVenta = new Date(baseDate);
      fechaVenta.setDate(baseDate.getDate() - (15 - i));
      const cliente = clientUsers[i % clientUsers.length];
      const vendedor = empUsers[i % empUsers.length];
      const prod1 = insertedProducts[(i * 2) % insertedProducts.length];
      const prod2 = insertedProducts[(i * 2 + 1) % insertedProducts.length];
      const cant1 = (i % 2 === 0) ? 1 : 2;
      const cant2 = 1;
      const totalVenta = (cant1 * prod1.precio_venta) + (cant2 * prod2.precio_venta);
      const metodo = (i % 3 === 0) ? 'Transferencia bancaria' : 'Efectivo';

      salesData.push({
        fecha: fechaVenta,
        total: totalVenta,
        cliente: cliente._id,
        metodo_pago: metodo,
        estado: 'Completada',
        usuario: vendedor._id,
        detalles: [
          { producto: prod1._id, cantidad: cant1, precio_unitario: prod1.precio_venta },
          { producto: prod2._id, cantidad: cant2, precio_unitario: prod2.precio_venta }
        ]
      });
    }
    const insertedSales = await Sale.insertMany(salesData);

    // ==========================================
    // 8. DEVOLUCIONES (15 registros)
    // ==========================================
    console.log('🔄 Insertando 15 Devoluciones...');
    const returnsData = [];
    const motivos = [
      'Cambio de talla por preferencia del cliente',
      'Costura con leve descosido en la manga',
      'Prenda no le quedó a la medida esperada',
      'Cambio de color por solicitud del comprador',
      'Detalle en el cierre o botón flojo'
    ];
    const estadosDev = ['Aceptada', 'Pendiente', 'Aceptada', 'Rechazada', 'Aceptada'];

    for (let i = 0; i < 15; i++) {
      const sale = insertedSales[i];
      const det = sale.detalles[0];
      const prod = insertedProducts.find(p => p._id.toString() === det.producto.toString());
      const fechaDev = new Date(sale.fecha);
      fechaDev.setHours(fechaDev.getHours() + 24);
      const est = estadosDev[i % estadosDev.length];

      returnsData.push({
        venta: sale._id,
        fecha: fechaDev,
        motivo: motivos[i % motivos.length],
        total_devolucion: det.precio_unitario * 1,
        usuario: sale.cliente || clientUsers[0]._id,
        estado: est,
        fecha_resolucion: est !== 'Pendiente' ? new Date(fechaDev.getTime() + 12 * 60 * 60 * 1000) : null,
        admin: est !== 'Pendiente' ? adminUser._id : null,
        detalles: [
          { producto: det.producto, cantidad: 1, precio_unitario: det.precio_unitario }
        ]
      });
    }
    const insertedReturns = await Return.insertMany(returnsData);

    // ==========================================
    // 9. HISTORIAL DE KARDEX / INVENTARIO (15 registros)
    // ==========================================
    console.log('📊 Insertando 15 Movimientos de Historial de Inventario...');
    const kardexData = [];
    for (let i = 0; i < 15; i++) {
      const prod = insertedProducts[i];
      const fechaMov = new Date(baseDate);
      fechaMov.setDate(baseDate.getDate() - (15 - i));
      const tipo = (i % 3 === 0) ? 'Entrada' : (i % 3 === 1 ? 'Salida' : 'Ajuste');
      const cant = (i % 4) + 2;

      kardexData.push({
        fecha_registro: fechaMov,
        stock_disponible: prod.stock,
        cantidad: cant,
        tipo_movimiento: tipo,
        producto: prod._id,
        concepto: tipo === 'Entrada' ? `Abastecimiento de lote #${i + 101}` : (tipo === 'Salida' ? `Salida por facturación venta #${i + 1}` : `Ajuste periódico de inventario físico`),
        usuario: (i % 2 === 0) ? adminUser._id : empUsers[0]._id
      });
    }
    const insertedKardex = await InventoryHistory.insertMany(kardexData);

    console.log('\n✨ ¡Sembrado completado con éxito!');
    console.log('----------------------------------------------------');
    console.log(`✅ Usuarios insertados:          ${insertedUsers.length}`);
    console.log(`✅ Categorías insertadas:        ${insertedCategories.length}`);
    console.log(`✅ Proveedores insertados:       ${insertedSuppliers.length}`);
    console.log(`✅ Productos insertados:         ${insertedProducts.length}`);
    console.log(`✅ Sesiones de Caja:             ${insertedCashRegisters.length}`);
    console.log(`✅ Compras a Proveedores:        ${insertedPurchases.length}`);
    console.log(`✅ Ventas registradas:           ${insertedSales.length}`);
    console.log(`✅ Devoluciones registradas:     ${insertedReturns.length}`);
    console.log(`✅ Movimientos de Kardex:        ${insertedKardex.length}`);
    console.log('----------------------------------------------------');
    console.log('🔑 Credenciales para pruebas:');
    console.log('   - Admin:      admin / admin');
    console.log('   - Empleados:  ailyn_emp / 123456');
    console.log('   - Clientes:   camila_cliente / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar los datos:', error);
    process.exit(1);
  }
};

seedDatabase();
