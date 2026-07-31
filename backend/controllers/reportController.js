const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
const Return = require('../models/Return');
const CashRegister = require('../models/CashRegister');

// @desc    Obtener KPIs para el Dashboard
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Ventas totales y cantidad
    const salesStats = await Sale.aggregate([
      {
        $facet: {
          totales: [
            { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
          ],
          completadas: [
            { $match: { estado: 'Completada' } },
            { $group: { _id: null, count: { $sum: 1 } } }
          ],
          hoy: [
            {
              $match: {
                fecha: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const salesTotal = salesStats[0]?.totales[0]?.total || 0;
    const salesCount = salesStats[0]?.totales[0]?.count || 0;
    const salesCompletadas = salesStats[0]?.completadas[0]?.count || 0;
    const salesHoy = salesStats[0]?.hoy[0]?.count || 0;

    // 2. Productos totales y en stock
    const productsCount = await Product.countDocuments({});
    const productsStockInfo = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$stock' } } }
    ]);
    const totalStock = productsStockInfo[0]?.totalStock || 0;

    // 3. Clientes totales (rol 'Cliente')
    const clientsCount = await User.countDocuments({ rol: 'Cliente' });

    // 4. Devoluciones pendientes
    const pendingReturns = await Return.countDocuments({ estado: 'Pendiente' });

    // 5. Caja activa
    const activeRegister = await CashRegister.findOne({ estado: 'Abierta' }).populate('usuario', 'nombre apellido');

    res.json({
      ok: true,
      ventas: {
        total: salesTotal,
        cantidad: salesCount,
        completadas: salesCompletadas,
        hoy: salesHoy
      },
      productos: {
        total: productsCount,
        stock: totalStock
      },
      clientes: {
        total: clientsCount
      },
      devoluciones: {
        pendientes: pendingReturns
      },
      cajaActiva: activeRegister ? {
        id: activeRegister._id,
        saldo_inicial: activeRegister.saldo_inicial,
        responsable: `${activeRegister.usuario.nombre} ${activeRegister.usuario.apellido}`,
        fecha_apertura: activeRegister.fecha_apertura
      } : null
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

// @desc    Obtener datos avanzados de reportes por periodo
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getReportAnalytics = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    if (!desde || !hasta) {
      return res.status(400).json({ ok: false, msg: 'Debe especificar fechas de inicio y fin (desde/hasta)' });
    }

    const startDate = new Date(desde);
    const endDate = new Date(hasta);
    endDate.setHours(23, 59, 59, 999); // Todo el día final

    // 1. Ventas por día dentro del rango
    const salesByDay = await Sale.aggregate([
      { $match: { fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Ventas últimos 6 meses (para tendencia fija)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const salesTrend = await Sale.aggregate([
      { $match: { fecha: { $gte: sixMonthsAgo }, estado: 'Completada' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Productos más vendidos
    const topProducts = await Sale.aggregate([
      { $match: { fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' } },
      { $unwind: '$detalles' },
      {
        $group: {
          _id: '$detalles.producto',
          cantidad: { $sum: '$detalles.cantidad' },
          total: { $sum: { $multiply: ['$detalles.cantidad', '$detalles.precio_unitario'] } }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productoInfo'
        }
      },
      { $unwind: '$productoInfo' },
      {
        $project: {
          nombre: '$productoInfo.nombre',
          talla: '$productoInfo.talla',
          color: '$productoInfo.color',
          cantidad: 1,
          total: 1
        }
      }
    ]);

    // 4. Clientes top
    const topClients = await Sale.aggregate([
      { $match: { fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada', cliente: { $ne: null } } },
      {
        $group: {
          _id: '$cliente',
          compras: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'clienteInfo'
        }
      },
      { $unwind: '$clienteInfo' },
      {
        $project: {
          nombre: '$clienteInfo.nombre',
          apellido: '$clienteInfo.apellido',
          email: '$clienteInfo.email',
          compras: 1,
          total: 1
        }
      }
    ]);

    // 5. Métodos de pago
    const paymentMethods = await Sale.aggregate([
      { $match: { fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' } },
      {
        $group: {
          _id: '$metodo_pago',
          total: { $sum: '$total' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    res.json({
      ok: true,
      graficaPeriodo: salesByDay,
      tendenciaMensual: salesTrend,
      productosTop: topProducts,
      clientesTop: topClients,
      metodosPago: paymentMethods
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getReportAnalytics
};
