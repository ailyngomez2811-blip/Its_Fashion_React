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

// Helper para formatear dinero
const formatMoney = (val) => {
  return '$' + Number(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// @desc    Exportar reporte consolidado en HTML para Imprimir / Guardar como PDF
// @route   GET /api/reports/export/pdf
// @access  Private
const exportPdf = async (req, res) => {
  const { Ventas, Inventario, Productos_mas_vendidos, Devoluciones, desde, hasta } = req.query;

  const startDate = desde ? new Date(desde) : new Date(new Date().setDate(new Date().getDate() - 7));
  const endDate = hasta ? new Date(hasta) : new Date();
  endDate.setHours(23, 59, 59, 999);

  try {
    let sales = [];
    let kpis = null;
    let products = [];
    let topProducts = [];
    let returns = [];

    // 1. Ventas
    if (Ventas === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      sales = await Sale.find({ fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' })
        .populate('cliente', 'nombre apellido')
        .sort({ fecha: -1 });

      const totals = await Sale.aggregate([
        { $match: { fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' } },
        {
          $group: {
            _id: null,
            total_periodo: { $sum: '$total' },
            transacciones: { $sum: 1 },
            efectivo: { $sum: { $cond: [{ $eq: ['$metodo_pago', 'Efectivo'] }, '$total', 0] } },
            transferencia: { $sum: { $cond: [{ $eq: ['$metodo_pago', 'Transferencia bancaria'] }, '$total', 0] } }
          }
        }
      ]);

      kpis = totals[0] || { total_periodo: 0, transacciones: 0, efectivo: 0, transferencia: 0 };
    }

    // 2. Inventario
    if (Inventario === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      products = await Product.find({}).populate('categoria', 'nombre');
    }

    // 3. Productos más vendidos
    if (Productos_mas_vendidos === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      topProducts = await Sale.aggregate([
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
    }

    // 4. Devoluciones
    if (Devoluciones === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      returns = await Return.find({ fecha: { $gte: startDate, $lte: endDate } })
        .populate({
          path: 'venta',
          populate: { path: 'cliente', select: 'nombre apellido' }
        })
        .populate('cliente', 'nombre apellido')
        .sort({ fecha: -1 });
    }

    // Generar HTML optimizado para imprimir en PDF
    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Actividad - Its Fashion</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 40px;
          font-size: 12px;
          line-height: 1.5;
        }
        header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-title {
          font-size: 20px;
          font-weight: bold;
          color: #0f172a;
        }
        .brand-title span {
          color: #2563eb;
        }
        .header-meta {
          text-align: right;
          font-size: 10px;
          color: #64748b;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #0f172a;
          margin-top: 30px;
          margin-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: bold;
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .kpi-table {
          margin-bottom: 25px;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px;
          text-align: center;
          border-radius: 8px;
        }
        .kpi-val {
          font-size: 16px;
          font-weight: bold;
          color: #1e3a8a;
        }
        .kpi-lbl {
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="brand-title">Its <span>Fashion</span></div>
        <div class="header-meta">
          <strong>Rango:</strong> ${new Date(startDate).toLocaleDateString('es-CO')} - ${new Date(endDate).toLocaleDateString('es-CO')}<br>
          <strong>Generado:</strong> ${new Date().toLocaleString('es-CO')}
        </div>
      </header>

      <h1>Reporte Consolidado de Actividad</h1>
    `;

    // Renderizar KPIs si aplica
    if (kpis) {
      html += `
      <table class="kpi-table" style="border:none;">
        <tr style="border:none;">
          <td style="border:none; width: 25%;">
            <div class="kpi-card">
              <div class="kpi-val">${formatMoney(kpis.total_periodo)}</div>
              <div class="kpi-lbl">Ingresos Totales</div>
            </div>
          </td>
          <td style="border:none; width: 25%;">
            <div class="kpi-card">
              <div class="kpi-val">${kpis.transacciones}</div>
              <div class="kpi-lbl">Transacciones</div>
            </div>
          </td>
          <td style="border:none; width: 25%;">
            <div class="kpi-card">
              <div class="kpi-val">${formatMoney(kpis.transacciones > 0 ? kpis.total_periodo / kpis.transacciones : 0)}</div>
              <div class="kpi-lbl">Ticket Promedio</div>
            </div>
          </td>
          <td style="border:none; width: 25%;">
            <div class="kpi-card">
              <div class="kpi-val">${formatMoney(kpis.efectivo)}</div>
              <div class="kpi-lbl">Recaudado Efectivo</div>
            </div>
          </td>
        </tr>
      </table>
      `;
    }

    // Renderizar Ventas
    if (sales.length > 0) {
      html += `
      <div class="section-title">Detalle de Ventas</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th>Método Pago</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(s => `
            <tr>
              <td>${new Date(s.fecha).toLocaleDateString('es-CO')}</td>
              <td>#${s._id.toString().substring(18)}</td>
              <td>${s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}` : 'Venta General'}</td>
              <td>${s.metodo_pago}</td>
              <td style="font-weight: bold;">${formatMoney(s.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      `;
    }

    // Renderizar Inventario
    if (products.length > 0) {
      html += `
      <div class="section-title">Estado de Inventario</div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Talla / Color</th>
            <th>Stock Mínimo</th>
            <th>Stock Actual</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.categoria?.nombre || 'General'}</td>
              <td>Talla ${p.talla} / Color ${p.color}</td>
              <td>${p.stock_minimo || 0}</td>
              <td style="font-weight: bold; color: ${p.stock <= p.stock_minimo ? '#dc2626' : '#1e293b'}">${p.stock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      `;
    }

    // Renderizar Productos más vendidos
    if (topProducts.length > 0) {
      html += `
      <div class="section-title">Prendas Más Vendidas</div>
      <table>
        <thead>
          <tr>
            <th>Prenda</th>
            <th>Talla / Color</th>
            <th>Unidades Vendidas</th>
            <th>Ingresos Totales</th>
          </tr>
        </thead>
        <tbody>
          ${topProducts.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>Talla ${p.talla} / Color ${p.color}</td>
              <td>${p.cantidad} unidades</td>
              <td style="font-weight: bold; color: #2563eb;">${formatMoney(p.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      `;
    }

    // Renderizar Devoluciones
    if (returns.length > 0) {
      html += `
      <div class="section-title">Historial de Devoluciones</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Venta original</th>
            <th>Cliente</th>
            <th>Motivo</th>
            <th>Total Devuelto</th>
          </tr>
        </thead>
        <tbody>
          ${returns.map(r => `
            <tr>
              <td>${new Date(r.fecha).toLocaleDateString('es-CO')}</td>
              <td>#${(r.venta?._id || r.venta || '').toString().substring(18)}</td>
              <td>${r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : 'Venta General'}</td>
              <td><em>"${r.motivo}"</em></td>
              <td style="font-weight: bold; color: #dc2626;">-${formatMoney(r.monto_devuelto)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      `;
    }

    html += `
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Error al generar PDF: ' + error.message);
  }
};

// @desc    Exportar reporte consolidado en XLS (Excel)
// @route   GET /api/reports/export/excel
// @access  Private
const exportExcel = async (req, res) => {
  const { Ventas, Inventario, Productos_mas_vendidos, Devoluciones, desde, hasta } = req.query;

  const startDate = desde ? new Date(desde) : new Date(new Date().setDate(new Date().getDate() - 7));
  const endDate = hasta ? new Date(hasta) : new Date();
  endDate.setHours(23, 59, 59, 999);

  try {
    let sales = [];
    let products = [];
    let topProducts = [];
    let returns = [];

    if (Ventas === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      sales = await Sale.find({ fecha: { $gte: startDate, $lte: endDate }, estado: 'Completada' })
        .populate('cliente', 'nombre apellido')
        .sort({ fecha: -1 });
    }

    if (Inventario === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      products = await Product.find({}).populate('categoria', 'nombre');
    }

    if (Productos_mas_vendidos === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      topProducts = await Sale.aggregate([
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
    }

    if (Devoluciones === '1' || (!Ventas && !Inventario && !Productos_mas_vendidos && !Devoluciones)) {
      returns = await Return.find({ fecha: { $gte: startDate, $lte: endDate } })
        .populate('cliente', 'nombre apellido')
        .sort({ fecha: -1 });
    }

    // Estilo básico compatible con Excel HTML
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11px; }
        .th-header { background-color: #f1f5f9; color: #475569; font-weight: bold; border: 1px solid #cbd5e1; text-align: left; height: 28px; }
        .td-data { border: 1px solid #e2e8f0; height: 26px; vertical-align: middle; }
        .title { font-size: 16px; font-weight: bold; color: #0f172a; height: 35px; }
      </style>
    </head>
    <body>
      <table>
        <tr><td class="title">REPORTE CONSOLIDADO - ITS FASHION</td></tr>
        <tr><td>Rango: ${new Date(startDate).toLocaleDateString('es-CO')} al ${new Date(endDate).toLocaleDateString('es-CO')}</td></tr>
      </table>
      <br/>
    `;

    if (sales.length > 0) {
      html += `
      <table>
        <tr><td style="font-size:12px; font-weight:bold; color:#2563eb; height:25px;">VENTAS</td></tr>
      </table>
      <table>
        <thead>
          <tr>
            <th class="th-header">Fecha</th>
            <th class="th-header">ID Venta</th>
            <th class="th-header">Cliente</th>
            <th class="th-header">Método Pago</th>
            <th class="th-header">Total</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(s => `
            <tr>
              <td class="td-data">${new Date(s.fecha).toLocaleDateString('es-CO')}</td>
              <td class="td-data">#${s._id.toString().substring(18)}</td>
              <td class="td-data">${s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}` : 'Venta General'}</td>
              <td class="td-data">${s.metodo_pago}</td>
              <td class="td-data" style="font-weight:bold;">${formatMoney(s.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br/>
      `;
    }

    if (products.length > 0) {
      html += `
      <table>
        <tr><td style="font-size:12px; font-weight:bold; color:#2563eb; height:25px;">ESTADO DE INVENTARIO</td></tr>
      </table>
      <table>
        <thead>
          <tr>
            <th class="th-header">Producto</th>
            <th class="th-header">Categoría</th>
            <th class="th-header">Talla / Color</th>
            <th class="th-header">Stock Mínimo</th>
            <th class="th-header">Stock Actual</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td class="td-data">${p.nombre}</td>
              <td class="td-data">${p.categoria?.nombre || 'General'}</td>
              <td class="td-data">Talla ${p.talla} / Color ${p.color}</td>
              <td class="td-data">${p.stock_minimo || 0}</td>
              <td class="td-data" style="font-weight:bold;">${p.stock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br/>
      `;
    }

    if (topProducts.length > 0) {
      html += `
      <table>
        <tr><td style="font-size:12px; font-weight:bold; color:#2563eb; height:25px;">PRENDAS MÁS VENDIDAS</td></tr>
      </table>
      <table>
        <thead>
          <tr>
            <th class="th-header">Prenda</th>
            <th class="th-header">Talla / Color</th>
            <th class="th-header">Unidades Vendidas</th>
            <th class="th-header">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          ${topProducts.map(p => `
            <tr>
              <td class="td-data">${p.nombre}</td>
              <td class="td-data">Talla ${p.talla} / Color ${p.color}</td>
              <td class="td-data">${p.cantidad}</td>
              <td class="td-data" style="font-weight:bold;">${formatMoney(p.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br/>
      `;
    }

    if (returns.length > 0) {
      html += `
      <table>
        <tr><td style="font-size:12px; font-weight:bold; color:#2563eb; height:25px;">DEVOLUCIONES</td></tr>
      </table>
      <table>
        <thead>
          <tr>
            <th class="th-header">Fecha</th>
            <th class="th-header">Venta</th>
            <th class="th-header">Cliente</th>
            <th class="th-header">Motivo</th>
            <th class="th-header">Monto Reembolsado</th>
          </tr>
        </thead>
        <tbody>
          ${returns.map(r => `
            <tr>
              <td class="td-data">${new Date(r.fecha).toLocaleDateString('es-CO')}</td>
              <td class="td-data">#${(r.venta?._id || r.venta || '').toString().substring(18)}</td>
              <td class="td-data">${r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : 'Venta General'}</td>
              <td class="td-data"><em>"${r.motivo}"</em></td>
              <td class="td-data" style="font-weight:bold; color:#dc2626;">-${formatMoney(r.monto_devuelto)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br/>
      `;
    }

    html += `
    </body>
    </html>
    `;

    // BOM para UTF-8 en Excel
    const bomHtml = "\xEF\xBB\xBF" + html;

    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_Its_Fashion_${Date.now()}.xls"`);
    res.send(bomHtml);
  } catch (error) {
    res.status(500).send('Error al generar Excel: ' + error.message);
  }
};

module.exports = {
  getDashboardStats,
  getReportAnalytics,
  exportPdf,
  exportExcel
};
