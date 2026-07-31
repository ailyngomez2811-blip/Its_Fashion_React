import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Warehouse, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FolderOpen,
  User
} from 'lucide-react';

const Inventario = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'Administrador';

  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [prodFilter, setProdFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({
    id_producto: '',
    tipo_movimiento: 'Entrada',
    cantidad: '',
    concepto: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [histRes, prodRes, catRes] = await Promise.all([
        API.get('/products/kardex'),
        API.get('/products'),
        API.get('/categories')
      ]);

      setHistory(histRes.data);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error al cargar kárdex de inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenAdjust = () => {
    setAdjustData({
      id_producto: '',
      tipo_movimiento: 'Entrada',
      cantidad: '',
      concepto: ''
    });
    setErrorMsg('');
    setAdjustModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdjustData({ ...adjustData, [name]: value });
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const qty = parseInt(adjustData.cantidad);
    if (!adjustData.id_producto || !adjustData.tipo_movimiento || isNaN(qty) || qty <= 0 || !adjustData.concepto.trim()) {
      setErrorMsg('Completa todos los campos obligatorios con valores válidos');
      return;
    }

    try {
      const res = await API.post(`/products/${adjustData.id_producto}/adjust`, {
        tipo_movimiento: adjustData.tipo_movimiento,
        cantidad: qty,
        concepto: adjustData.concepto.trim()
      });

      if (res.data.ok) {
        showToast('Ajuste de inventario aplicado exitosamente');
        setAdjustModal(false);
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al aplicar ajuste de inventario');
    }
  };

  // KPIs
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.stock > p.stock_minimo).length;
  const criticalCount = products.filter(p => p.stock > 0 && p.stock <= p.stock_minimo).length;
  const noStockCount = products.filter(p => p.stock === 0).length;

  // Filtrado de la tabla de Kárdex
  const filteredHistory = history.filter(h => {
    const matchSearch = !searchTerm || 
      (h.producto?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.concepto || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchProd = !prodFilter || h.producto?._id === prodFilter;
    const matchCat = !catFilter || h.producto?.categoria === catFilter;
    const matchType = !typeFilter || h.tipo_movimiento === typeFilter;

    return matchSearch && matchProd && matchCat && matchType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Kárdex de Inventario</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Historial completo de movimientos de mercancía entrada / salida</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdjust}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" /> Ajuste de Stock
          </button>
        )}
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !adjustModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            <p className="text-xs text-slate-500 font-light">Total Artículos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{inStockCount}</p>
            <p className="text-xs text-slate-500 font-light">Stock Estable</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{criticalCount}</p>
            <p className="text-xs text-slate-500 font-light">Stock Crítico</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{noStockCount}</p>
            <p className="text-xs text-slate-500 font-light">Agotados</p>
          </div>
        </div>

      </div>

      {/* Historial Kárdex */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Kárdex de Movimientos</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Mostrando {filteredHistory.length} registros de inventario</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar por concepto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-52"
              />
            </div>
            
            <select 
              value={prodFilter}
              onChange={(e) => setProdFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition w-44"
            >
              <option value="">Todas las prendas</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.nombre} ({p.talla}/{p.color})</option>
              ))}
            </select>

            <select 
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todas las categorías</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>

            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los Movs</option>
              <option value="Entrada">Entradas (+)</option>
              <option value="Salida">Salidas (-)</option>
            </select>
          </div>
        </div>

        {/* Tabla Kárdex */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto (Prenda)</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Talla / Color</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Restante</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando Kárdex...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400 font-light">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-light">No hay movimientos registrados en el Kárdex</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(h => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(h.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {h.producto?.nombre || 'Producto Eliminado'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {h.producto?.talla ? `Talla ${h.producto.talla} / ${h.producto.color}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        h.tipo_movimiento === 'Entrada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {h.tipo_movimiento === 'Entrada' ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5" />}
                        {h.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate" title={h.concepto}>
                      {h.concepto}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{h.cantidad}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{h.stock_disponible}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {h.usuario ? `${h.usuario.nombre} ${h.usuario.apellido}` : 'Sistema / Auto'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL AJUSTE MANUAL DE INVENTARIO */}
      {adjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Ajuste Manual de Inventario
              </h3>
              <button onClick={() => setAdjustModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmitAdjustment} className="p-6 space-y-4">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prenda a Ajustar *</label>
                <select 
                  name="id_producto"
                  value={adjustData.id_producto}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Selecciona producto...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} ({p.talla}/{p.color}) — Stock actual: {p.stock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo Ajuste *</label>
                <select 
                  name="tipo_movimiento"
                  value={adjustData.tipo_movimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Entrada">Entrada (+)</option>
                  <option value="Salida">Salida (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cantidad de Artículos *</label>
                <input 
                  type="number" 
                  name="cantidad"
                  value={adjustData.cantidad}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Razón / Justificación *</label>
                <textarea 
                  name="concepto"
                  value={adjustData.concepto}
                  onChange={handleInputChange}
                  placeholder="Ej: Corrección de conteo anual / Artículo dañado en almacén"
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setAdjustModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">
                  Aplicar Ajuste
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Inventario;
