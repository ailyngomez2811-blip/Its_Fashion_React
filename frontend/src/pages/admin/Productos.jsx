import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Power,
  X,
  PlusCircle
} from 'lucide-react';

const Productos = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'Administrador';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    precio_compra: '',
    stock: '',
    stock_minimo: '',
    talla: '',
    color: '',
    estado: 'Activo',
    id_categoria: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, catFilter, statusFilter]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_venta: '',
      precio_compra: '',
      stock: '',
      stock_minimo: '',
      talla: '',
      color: '',
      estado: 'Activo',
      id_categoria: categories[0]?._id || ''
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio_venta: p.precio_venta,
      precio_compra: p.precio_compra,
      stock: p.stock,
      stock_minimo: p.stock_minimo || 0,
      talla: p.talla,
      color: p.color,
      estado: p.estado,
      id_categoria: p.categoria?._id || p.categoria
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validaciones idénticas al PHP
    const pVenta = parseFloat(formData.precio_venta);
    const pCompra = parseFloat(formData.precio_compra);
    const stockVal = parseInt(formData.stock);
    const stockMinVal = parseInt(formData.stock_minimo || 0);

    if (!formData.nombre.trim() || !formData.talla.trim() || !formData.color.trim() || !formData.id_categoria) {
      setErrorMsg('Completa todos los campos obligatorios');
      return;
    }

    if (isNaN(pVenta) || pVenta <= 0 || isNaN(pCompra) || pCompra <= 0) {
      setErrorMsg('Los precios deben ser valores numéricos positivos mayores a cero');
      return;
    }

    if (isNaN(stockVal) || stockVal < 0 || isNaN(stockMinVal) || stockMinVal < 0) {
      setErrorMsg('El stock y stock mínimo no pueden ser negativos');
      return;
    }

    if (pVenta <= pCompra) {
      setErrorMsg('El precio de venta debe ser mayor al precio de compra');
      return;
    }

    try {
      if (editingProduct) {
        // Editar
        const res = await API.put(`/products/${editingProduct._id}`, formData);
        if (res.data.ok) {
          showToast('Producto actualizado correctamente');
          setModalOpen(false);
          loadData();
        }
      } else {
        // Crear
        const res = await API.post('/products', formData);
        if (res.data.ok) {
          showToast('Producto creado correctamente');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al procesar la solicitud');
    }
  };

  const handleToggleStatus = async (p) => {
    const newStatus = p.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const res = await API.patch(`/products/${p._id}/status`, { estado: newStatus });
      if (res.data.ok) {
        showToast(`Producto ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
        loadData();
      }
    } catch (error) {
      showToast('Error al cambiar el estado del producto', false);
    }
  };

  // Cálculos de KPIs
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.estado === 'Activo').length;
  const criticalProducts = products.filter(p => p.estado === 'Activo' && p.stock > 0 && p.stock <= p.stock_minimo).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  // Filtrado de la tabla
  const filteredProducts = products.filter(p => {
    const matchSearch = searchTerm === '' || 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.talla.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoria?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = catFilter === '' || (p.categoria?._id || p.categoria) === catFilter;

    let matchStatus = true;
    if (statusFilter === 'Activo') matchStatus = p.estado === 'Activo';
    else if (statusFilter === 'Inactivo') matchStatus = p.estado === 'Inactivo';
    else if (statusFilter === 'critico') matchStatus = p.estado === 'Activo' && p.stock > 0 && p.stock <= p.stock_minimo;
    else if (statusFilter === 'agotado') matchStatus = p.stock === 0;

    return matchSearch && matchCat && matchStatus;
  });

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header local con botón de nuevo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Catálogo de Productos</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Prendas registradas en el sistema</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        )}
      </div>

      {/* Toasts / Notificaciones rápidas */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !modalOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            <p className="text-xs text-slate-500 font-light">Total productos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeProducts}</p>
            <p className="text-xs text-slate-500 font-light">Activos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{criticalProducts}</p>
            <p className="text-xs text-slate-500 font-light">Stock crítico</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{outOfStockProducts}</p>
            <p className="text-xs text-slate-500 font-light">Agotados</p>
          </div>
        </div>

      </div>

      {/* Tabla de Productos y Filtros */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Catálogo de Prendas</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Control y stock de inventario</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar prenda, talla, color..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-64"
              />
            </div>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los Estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
              <option value="critico">Stock crítico</option>
              <option value="agotado">Agotados</option>
            </select>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Talla / Color</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio de Venta</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando catálogo...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-light">No hay productos que coincidan con la búsqueda</p>
                  </td>
                </tr>
              ) : (
                currentItems.map(p => {
                  const isAgotado = p.stock === 0;
                  const isCritico = p.stock > 0 && p.stock <= p.stock_minimo;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{p.nombre}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]" title={p.descripcion}>{p.descripcion || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge bg-blue-50 text-blue-700 border border-blue-100">
                          {p.categoria?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="font-semibold">{p.talla}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{p.color}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        ${p.precio_venta.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-bold ${
                          isAgotado ? 'text-red-600' : isCritico ? 'text-amber-500' : 'text-slate-700'
                        }`}>
                          {p.stock}
                        </span>
                        {isCritico && <span className="ml-1 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold">¡Bajo!</span>}
                        {isAgotado && <span className="ml-1 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold">Agotado</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          p.estado === 'Activo' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(p)}
                            title="Editar prenda"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleToggleStatus(p)}
                              title={p.estado === 'Activo' ? 'Desactivar prenda' : 'Activar prenda'}
                              className={`p-1.5 hover:bg-slate-100 rounded-lg transition ${
                                p.estado === 'Activo' ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-green-600'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
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
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} resultados</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                Anterior
              </button>
              <span className="px-3 text-slate-600">Página {currentPage} de {totalPages || 1}</span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre del Producto *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Camisa Slim Fit de Lino"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Descripcion */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea 
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Detalles sobre tela, corte, etc."
                    rows="2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  ></textarea>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categoría *</label>
                  <select 
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Talla */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Talla *</label>
                  <input 
                    type="text" 
                    name="talla"
                    value={formData.talla}
                    onChange={handleInputChange}
                    placeholder="M, S, L, 32, etc."
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Color *</label>
                  <input 
                    type="text" 
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Negro, Azul Marino, etc."
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Stock Inicial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stock Inicial *</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Stock Minimo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stock Mínimo (Alerta)</label>
                  <input 
                    type="number" 
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleInputChange}
                    placeholder="Ej: 5"
                    min="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
                  <select 
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                {/* Precio Compra */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Precio Compra *</label>
                  <input 
                    type="number" 
                    name="precio_compra"
                    value={formData.precio_compra}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Precio Venta */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Precio Venta *</label>
                  <input 
                    type="number" 
                    name="precio_venta"
                    value={formData.precio_venta}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Productos;
