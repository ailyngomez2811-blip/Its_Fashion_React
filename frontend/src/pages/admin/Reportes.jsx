import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  BarChart, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft,
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FolderOpen,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

const Reportes = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('Este mes');
  
  // Rango de fechas
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Tab activa ('ventas', 'inventario', 'productos', 'devoluciones')
  const [activeTab, setActiveTab] = useState('ventas');

  // Modal exportar
  const [exportModal, setExportModal] = useState(false);
  const [exportTypes, setExportTypes] = useState({
    Ventas: true,
    Inventario: false,
    Productos_mas_vendidos: false,
    Devoluciones: false
  });

  const [data, setData] = useState({
    graficaPeriodo: [],
    tendenciaMensual: [],
    productosTop: [],
    clientesTop: [],
    metodosPago: []
  });
  
  const [criticalInventory, setCriticalInventory] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);

  const getPresetDates = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'Esta semana') {
      const currentDay = today.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay; // Lunes a Domingo
      start.setDate(today.getDate() + distance);
      end.setDate(start.getDate() + 6);
    } else if (preset === 'Este mes') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === 'Últimos 3 meses') {
      start.setMonth(today.getMonth() - 2);
      start.setDate(1);
    } else if (preset === 'Este año') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    }

    return {
      desde: start.toISOString().split('T')[0],
      hasta: end.toISOString().split('T')[0]
    };
  };

  const loadAnalytics = async (start, end) => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes, returnsRes] = await Promise.all([
        API.get('/reports/analytics', { params: { desde: start, hasta: end } }),
        API.get('/products'),
        API.get('/returns')
      ]);

      if (analyticsRes.data) {
        setData(analyticsRes.data);
      }
      if (productsRes.data) {
        // Filtrar inventario crítico (stock <= stock_minimo)
        setCriticalInventory(productsRes.data.filter(p => p.estado === 'Activo' && p.stock <= p.stock_minimo));
      }
      if (returnsRes.data) {
        // Filtrar devoluciones del periodo
        const filteredReturns = returnsRes.data.filter(r => {
          const rDate = new Date(r.fecha);
          return rDate >= new Date(start + 'T00:00:00') && rDate <= new Date(end + 'T23:59:59');
        });
        setRecentReturns(filteredReturns);
      }
    } catch (error) {
      console.error('Error al cargar analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (periodo !== 'Personalizado') {
      const dates = getPresetDates(periodo);
      setDesde(dates.desde);
      setHasta(dates.hasta);
      loadAnalytics(dates.desde, dates.hasta);
    }
  }, [periodo]);

  const handleFetchCustom = () => {
    if (desde && hasta) {
      setPeriodo('Personalizado');
      loadAnalytics(desde, hasta);
    }
  };

  const handleCheckboxChange = (name) => {
    setExportTypes({ ...exportTypes, [name]: !exportTypes[name] });
  };

  const handleExport = (format) => {
    const activeParams = [];
    Object.entries(exportTypes).forEach(([key, val]) => {
      if (val) activeParams.push(`${key}=1`);
    });
    if (desde) activeParams.push(`desde=${desde}`);
    if (hasta) activeParams.push(`hasta=${hasta}`);
    
    // Adjuntar token de autenticación
    const token = localStorage.getItem('token');
    if (token) activeParams.push(`token=${token}`);
    
    const queryString = activeParams.join('&');
    const endpoint = format === 'PDF' ? 'export/pdf' : 'export/excel';
    
    // Abrir endpoint de exportación del backend en nueva pestaña
    window.open(`http://localhost:5000/api/reports/${endpoint}?${queryString}`, '_blank');
    setExportModal(false);
  };

  // Cálculos de KPIs
  const totalFacturado = data.graficaPeriodo.reduce((acc, curr) => acc + curr.total, 0);
  const totalTransacciones = data.metodosPago.reduce((acc, curr) => acc + curr.cantidad, 0);
  const ticketPromedio = totalTransacciones > 0 ? (totalFacturado / totalTransacciones) : 0;
  const totalClientes = data.clientesTop.length;

  // Gráfico de barras SVG dinámico
  const renderSVGChart = (chartData) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-light">
          No hay datos de ventas en este rango.
        </div>
      );
    }

    const maxVal = Math.max(...chartData.map(d => d.total), 1000);
    const chartHeight = 220;
    const chartWidth = 600;
    const barWidth = Math.max(10, (chartWidth / chartData.length) - 8);

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
        {chartData.map((d, index) => {
          const barHeight = (d.total / maxVal) * (chartHeight - 40);
          const x = index * (chartWidth / chartData.length) + 4;
          const y = chartHeight - barHeight - 25;

          return (
            <g key={index} className="group cursor-pointer">
              <title>{`${d._id}: $${d.total.toLocaleString('es-CO')}`}</title>
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="3" 
                className="fill-blue-600 hover:fill-blue-500 transition-colors duration-300"
              />
              <text 
                x={x + barWidth / 2} 
                y={chartHeight - 6} 
                textAnchor="middle" 
                className="fill-slate-400 font-sans text-[8px] font-medium"
              >
                {d._id.substring(5)}
              </text>
            </g>
          );
        })}
        <line x1="0" y1={chartHeight - 22} x2={chartWidth} y2={chartHeight - 22} stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header local con botón de Exportar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <BarChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Reportes e Inteligencia</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Análisis y estadísticas de rendimiento comercial</p>
          </div>
        </div>
        <button 
          onClick={() => setExportModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-sm font-semibold rounded-xl transition duration-300 shadow-sm"
        >
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* Filtro de período */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {['Esta semana', 'Este mes', 'Últimos 3 meses', 'Este año'].map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                periodo === p ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto w-full lg:w-auto mt-2 lg:mt-0 bg-white p-2 border border-slate-200/80 rounded-2xl shadow-sm">
          <input 
            type="date" 
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          />
          <span className="text-slate-400 text-xs hidden lg:inline">→</span>
          <input 
            type="date" 
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          />
          <button 
            onClick={handleFetchCustom}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
          >
            Aplicar Rango
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Ingresos del período</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">${totalFacturado.toLocaleString('es-CO')}</p>
              <p className="text-[10px] text-slate-400 mt-1">Ventas completadas</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Transacciones</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalTransacciones}</p>
              <p className="text-[10px] text-slate-400 mt-1">Tickets generados</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-100 stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Ticket promedio</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">${ticketPromedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-slate-400 mt-1">por venta realizada</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-purple-100 stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Clientes activos</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalClientes}</p>
              <p className="text-[10px] text-slate-400 mt-1">con compras registradas</p>
            </div>
          </div>

          {/* Selector de Pestañas (Tabs) */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit max-w-full">
            {[
              { id: 'ventas', label: 'Ventas' },
              { id: 'inventario', label: 'Inventario' },
              { id: 'productos', label: 'Productos' },
              { id: 'devoluciones', label: 'Devoluciones' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: VENTAS */}
          {activeTab === 'ventas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 font-serif">Tendencia de Ingresos</h3>
                  <p className="text-xs text-slate-500 font-light">Distribución de facturación del período</p>
                </div>
                {renderSVGChart(data.graficaPeriodo)}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 font-serif">Recaudación por Método</h3>
                  <p className="text-xs text-slate-500 font-light mb-4">Ingresos desglosados</p>
                </div>
                <div className="space-y-3">
                  {data.metodosPago.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <span className="font-semibold text-slate-700">{m._id || 'Otro'}</span>
                      <span className="font-bold text-slate-800">${m.total.toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                  {data.metodosPago.length === 0 && (
                    <p className="text-center text-slate-400 text-xs py-6 font-light">No hay registros de cobros</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: INVENTARIO */}
          {activeTab === 'inventario' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-serif">Prendas con Stock Crítico</h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">Prendas activas que están en o por debajo del stock mínimo establecido</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Talla / Color</th>
                      <th className="px-6 py-4">Stock Mínimo</th>
                      <th className="px-6 py-4">Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {criticalInventory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-light">
                          No hay prendas en stock crítico en este momento.
                        </td>
                      </tr>
                    ) : (
                      criticalInventory.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">{p.nombre}</td>
                          <td className="px-6 py-4 text-xs">
                            <span className="badge bg-blue-50 text-blue-700 border border-blue-100">{p.categoria?.nombre || 'General'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">Talla {p.talla} / Color {p.color}</td>
                          <td className="px-6 py-4 text-slate-500">{p.stock_minimo || 0}</td>
                          <td className="px-6 py-4 text-red-600 font-bold">{p.stock}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PRODUCTOS (TOP MÁS VENDIDOS) */}
          {activeTab === 'productos' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-serif">Prendas Más Vendidas</h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">Top 5 de prendas con mayor salida en el período analizado</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Prenda</th>
                      <th className="px-6 py-4">Talla / Color</th>
                      <th className="px-6 py-4">Unidades Vendidas</th>
                      <th className="px-6 py-4">Ingresos Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {data.productosTop.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-light">
                          No hay registros de ventas en este período.
                        </td>
                      </tr>
                    ) : (
                      data.productosTop.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">{p.nombre}</td>
                          <td className="px-6 py-4 text-slate-600">Talla {p.talla} / Color {p.color}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">{p.cantidad} ud</td>
                          <td className="px-6 py-4 font-bold text-blue-600">${p.total.toLocaleString('es-CO')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: DEVOLUCIONES */}
          {activeTab === 'devoluciones' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-serif">Devoluciones del Período</h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">Últimas devoluciones solicitadas en el período seleccionado</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Venta</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Motivo</th>
                      <th className="px-6 py-4">Total Reembolsado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentReturns.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-light">
                          No hay devoluciones registradas en este período.
                        </td>
                      </tr>
                    ) : (
                      recentReturns.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-mono text-xs text-amber-600">#{r._id.substring(18)}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(r.fecha).toLocaleDateString('es-CO')}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">#{r.venta?._id?.substring(18) || r.venta}</td>
                          <td className="px-6 py-4 text-slate-700">{r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : 'Venta General'}</td>
                          <td className="px-6 py-4 text-slate-600 italic">"{r.motivo}"</td>
                          <td className="px-6 py-4 font-bold text-red-500">-${r.monto_devuelto.toLocaleString('es-CO')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL: EXPORTAR REPORTE */}
      {exportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-800">Exportar reporte</h3>
                <p className="text-xs text-slate-500 font-light">Selecciona el contenido y el formato</p>
              </div>
              <button 
                onClick={() => setExportModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkboxes */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tipo de reporte</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: 'Ventas', label: 'Ventas' },
                    { key: 'Inventario', label: 'Inventario' },
                    { key: 'Productos_mas_vendidos', label: 'Productos más vendidos' },
                    { key: 'Devoluciones', label: 'Devoluciones' }
                  ].map(t => (
                    <label key={t.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={exportTypes[t.key]}
                        onChange={() => handleCheckboxChange(t.key)}
                        className="accent-blue-600" 
                      />
                      <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format buttons */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Formato de exportación</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleExport('PDF')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs transition"
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    onClick={() => handleExport('Excel')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold text-xs transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reportes;
