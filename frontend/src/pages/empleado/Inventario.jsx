import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
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
  History,
  Boxes
} from 'lucide-react';

const Inventario = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'Administrador';

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'kardex'

  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros Inventario
  const [invSearch, setInvSearch] = useState('');
  const [invCatFilter, setInvCatFilter] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('');
  const [invCurrentPage, setInvCurrentPage] = useState(1);

  // Filtros Kárdex
  const [kardexSearch, setKardexSearch] = useState('');
  const [kardexProdFilter, setKardexProdFilter] = useState('');
  const [kardexCatFilter, setKardexCatFilter] = useState('');
  const [kardexTypeFilter, setKardexTypeFilter] = useState('');
  const [kardexCurrentPage, setKardexCurrentPage] = useState(1);

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

  useEffect(() => {
    setInvCurrentPage(1);
  }, [invSearch, invCatFilter, invStatusFilter]);

  useEffect(() => {
    setKardexCurrentPage(1);
  }, [kardexSearch, kardexProdFilter, kardexCatFilter, kardexTypeFilter]);

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

  // --- FILTRADO Y PAGINACIÓN INVENTARIO ---
  const filteredProducts = products.filter(p => {
    const matchSearch = !invSearch || 
      p.nombre.toLowerCase().includes(invSearch.toLowerCase()) ||
      p.talla.toLowerCase().includes(invSearch.toLowerCase()) ||
      p.color.toLowerCase().includes(invSearch.toLowerCase());

    const matchCat = !invCatFilter || p.categoria?._id === invCatFilter || p.categoria === invCatFilter;

    let matchStatus = true;
    if (invStatusFilter === 'con_stock') {
      matchStatus = p.stock > p.stock_minimo;
    } else if (invStatusFilter === 'critico') {
      matchStatus = p.stock > 0 && p.stock <= p.stock_minimo;
    } else if (invStatusFilter === 'sin_stock') {
      matchStatus = p.stock === 0;
    }

    return matchSearch && matchCat && matchStatus;
  });

  const invItemsPerPage = 8;
  const invTotalPages = Math.ceil(filteredProducts.length / invItemsPerPage);
  const invIndexOfLastItem = invCurrentPage * invItemsPerPage;
  const invIndexOfFirstItem = invIndexOfLastItem - invItemsPerPage;
  const currentProducts = filteredProducts.slice(invIndexOfFirstItem, invIndexOfLastItem);

  // --- FILTRADO Y PAGINACIÓN KÁRDEX ---
  const filteredHistory = history.filter(h => {
    const matchSearch = !kardexSearch || 
      (h.producto?.nombre || '').toLowerCase().includes(kardexSearch.toLowerCase()) ||
      (h.concepto || '').toLowerCase().includes(kardexSearch.toLowerCase());

    const matchProd = !kardexProdFilter || h.producto?._id === kardexProdFilter;
    const matchCat = !kardexCatFilter || h.producto?.categoria === kardexCatFilter || h.producto?.categoria?._id === kardexCatFilter;
    const matchType = !kardexTypeFilter || h.tipo_movimiento === kardexTypeFilter;

    return matchSearch && matchProd && matchCat && matchType;
  });

  const kardexItemsPerPage = 8;
  const kardexTotalPages = Math.ceil(filteredHistory.length / kardexItemsPerPage);
  const kardexIndexOfLastItem = kardexCurrentPage * kardexItemsPerPage;
  const kardexIndexOfFirstItem = kardexIndexOfLastItem - kardexItemsPerPage;
  const currentKardex = filteredHistory.slice(kardexIndexOfFirstItem, kardexIndexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Control de Inventario y Kardex</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Administración de existencias físicas y registro de movimientos</p>
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
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            <p className="text-xs text-slate-500 font-light">Total Artículos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{inStockCount}</p>
            <p className="text-xs text-slate-500 font-light">Con Stock</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 stat-card flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{criticalCount}</p>
            <p className="text-xs text-slate-500 font-light">Stock Crítico</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 stat-card flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{noStockCount}</p>
            <p className="text-xs text-slate-500 font-light">Sin Stock</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 focus:outline-none cursor-pointer ${
            activeTab === 'stock' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" /> Inventario Actual
        </button>
        <button 
          onClick={() => setActiveTab('kardex')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 focus:outline-none cursor-pointer ${
            activeTab === 'kardex' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" /> Kardex de Movimientos
        </button>
      </div>

      {/* SECCIÓN TAB 1: INVENTARIO ACTUAL */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-800 font-serif">Existencias en Bodega</h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Control de almacén y precios de venta</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Buscar prenda, talla..." 
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-56"
                />
              </div>

              <select 
                value={invCatFilter}
                onChange={(e) => setInvCatFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition w-44"
              >
                <option value="">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>

              <select 
                value={invStatusFilter}
                onChange={(e) => setInvStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="">Todos los stocks</option>
                <option value="con_stock">Con stock</option>
                <option value="critico">Stock crítico</option>
                <option value="sin_stock">Sin stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Talla / Color</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">P. Compra</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">P. Venta</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Actual</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Mín.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      Cargando existencias...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-light">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                      No hay artículos que coincidan con la búsqueda
                    </td>
                  </tr>
                ) : (
                  currentProducts.map(p => {
                    const isOutOfStock = p.stock === 0;
                    const isCritical = p.stock > 0 && p.stock <= p.stock_minimo;
                    const badgeClass = isOutOfStock 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : isCritical 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{p.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{p._id.substring(18)}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.categoria?.nombre || '—'}</td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="font-semibold">{p.talla}</span> <span className="text-slate-400">/</span> {p.color}
                        </td>
                        <td className="px-6 py-4 text-slate-600">${p.precio_compra?.toLocaleString('es-CO')}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">${p.precio_venta?.toLocaleString('es-CO')}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${badgeClass}`}>
                            {p.stock} uds
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{p.stock_minimo || 0} uds</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
              <span>Mostrando {invIndexOfFirstItem + 1}-{Math.min(invIndexOfLastItem, filteredProducts.length)} de {filteredProducts.length} resultados</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setInvCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={invCurrentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  Anterior
                </button>
                <span className="px-3 text-slate-600">Página {invCurrentPage} de {invTotalPages || 1}</span>
                <button
                  type="button"
                  onClick={() => setInvCurrentPage(prev => Math.min(prev + 1, invTotalPages))}
                  disabled={invCurrentPage === invTotalPages || invTotalPages <= 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN TAB 2: HISTORIAL KÁRDEX */}
      {activeTab === 'kardex' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
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
                  value={kardexSearch}
                  onChange={(e) => setKardexSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-52"
                />
              </div>
              
              <select 
                value={kardexProdFilter}
                onChange={(e) => setKardexProdFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition w-44"
              >
                <option value="">Todas las prendas</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.nombre} ({p.talla}/{p.color})</option>
                ))}
              </select>

              <select 
                value={kardexCatFilter}
                onChange={(e) => setKardexCatFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>

              <select 
                value={kardexTypeFilter}
                onChange={(e) => setKardexTypeFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="">Todos los Movs</option>
                <option value="Entrada">Entradas (+)</option>
                <option value="Salida">Salidas (-)</option>
                <option value="Ajuste">Ajustes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto (Prenda)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Talla / Color</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      Cargando kárdex...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-light">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                      No hay registros en el kárdex
                    </td>
                  </tr>
                ) : (
                  currentKardex.map(h => {
                    const isEntrada = h.tipo_movimiento === 'Entrada';
                    const iconStyle = isEntrada ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100';

                    return (
                      <tr key={h._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(h.fecha_registro || h.fecha).toLocaleString('es-CO')}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{h.producto?.nombre || '—'}</td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="font-semibold">{h.producto?.talla || '—'}</span> <span className="text-slate-400">/</span> {h.producto?.color || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${iconStyle}`}>
                            {isEntrada ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            {h.tipo_movimiento}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-light max-w-xs truncate" title={h.concepto}>{h.concepto}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{h.cantidad} uds</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{(h.stock_disponible !== undefined ? h.stock_disponible : h.stock_final)} uds</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredHistory.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
              <span>Mostrando {kardexIndexOfFirstItem + 1}-{Math.min(kardexIndexOfLastItem, filteredHistory.length)} de {filteredHistory.length} resultados</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setKardexCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={kardexCurrentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  Anterior
                </button>
                <span className="px-3 text-slate-600">Página {kardexCurrentPage} de {kardexTotalPages || 1}</span>
                <button
                  type="button"
                  onClick={() => setKardexCurrentPage(prev => Math.min(prev + 1, kardexTotalPages))}
                  disabled={kardexCurrentPage === kardexTotalPages || kardexTotalPages <= 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: AJUSTE DE STOCK */}
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prenda / Artículo *</label>
                <select 
                  name="id_producto"
                  value={adjustData.id_producto}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Selecciona prenda...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} ({p.talla} / {p.color}) — Stock: {p.stock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo de Movimiento *</label>
                <select 
                  name="tipo_movimiento"
                  value={adjustData.tipo_movimiento}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Entrada">Entrada (+)</option>
                  <option value="Salida">Salida (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cantidad *</label>
                <input 
                  type="number" 
                  name="cantidad"
                  min="1"
                  value={adjustData.cantidad}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: 5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Concepto / Justificación *</label>
                <textarea 
                  name="concepto"
                  rows="3"
                  value={adjustData.concepto}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Ingreso de mercancía por reabastecimiento / Pérdida o prenda fallada"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none"
                ></textarea>
              </div>

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
