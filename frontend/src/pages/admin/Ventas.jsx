import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  CreditCard,
  User,
  PlusCircle,
  Undo2
} from 'lucide-react';

const Ventas = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeCaja, setActiveCaja] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [newSaleModal, setNewSaleModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [devModal, setDevModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Form de nueva venta
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cartItems, setCartItems] = useState([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Form de devolución
  const [devItems, setDevItems] = useState({}); // mapping: id_producto -> cantidad a devolver
  const [devMotivo, setDevMotivo] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [salesRes, prodRes, usersRes, activeCajaRes] = await Promise.all([
        API.get('/sales'),
        API.get('/products'),
        API.get('/auth/users').catch(() => ({ data: [] })), // Puede fallar si no es admin, fallback vacío
        API.get('/cash-registers/active')
      ]);

      setSales(salesRes.data);
      setProducts(prodRes.data.filter(p => p.estado === 'Activo' && p.stock > 0));
      if (usersRes.data) {
        setClients(usersRes.data.filter(u => u.rol === 'Cliente'));
      }
      if (activeCajaRes.data.ok) {
        setActiveCaja(activeCajaRes.data.active);
      } else {
        setActiveCaja(null);
      }
    } catch (error) {
      console.error('Error al cargar datos de facturación:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDesde, filterHasta, filterMetodo, filterEstado]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenNewSale = () => {
    setCartItems([]);
    setSelectedClient(null);
    setClientSearch('');
    setMetodoPago('Efectivo');
    setSelectedProdId('');
    setQuantity('1');
    setErrorMsg('');
    setNewSaleModal(true);
  };

  const handleAddToCart = () => {
    setErrorMsg('');
    if (!selectedProdId) {
      setErrorMsg('Selecciona un producto');
      return;
    }
    const qtyVal = parseInt(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      setErrorMsg('La cantidad debe ser un número entero positivo');
      return;
    }

    const prod = products.find(p => p._id === selectedProdId);
    if (!prod) return;

    // Verificar si ya está en el carrito
    const existing = cartItems.find(item => item.producto._id === prod._id);
    const currentQty = existing ? existing.cantidad : 0;

    if (qtyVal + currentQty > prod.stock) {
      setErrorMsg(`No hay suficiente stock. Disponible: ${prod.stock}`);
      return;
    }

    if (existing) {
      setCartItems(cartItems.map(item => 
        item.producto._id === prod._id ? { ...item, cantidad: item.cantidad + qtyVal } : item
      ));
    } else {
      setCartItems([...cartItems, { producto: prod, cantidad: qtyVal, precio_unitario: prod.precio_venta }]);
    }

    setSelectedProdId('');
    setQuantity('1');
  };

  const handleRemoveFromCart = (idx) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
  };

  const handleConfirmSale = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('El carrito está vacío');
      return;
    }

    if (metodoPago === 'Efectivo' && !activeCaja) {
      setErrorMsg('No hay una caja abierta. Abre la caja registradora primero para recibir pagos en efectivo.');
      return;
    }

    const payload = {
      id_cliente: selectedClient ? selectedClient._id : null,
      metodo_pago: metodoPago,
      detalles: cartItems.map(item => ({
        id_producto: item.producto._id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    try {
      const res = await API.post('/sales', payload);
      if (res.data.ok) {
        showToast('Venta facturada exitosamente');
        setNewSaleModal(false);
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al procesar la venta');
    }
  };

  const handleOpenDetail = (sale) => {
    setSelectedSale(sale);
    setDetailModal(true);
  };

  const handleOpenDev = (sale) => {
    setSelectedSale(sale);
    const initialDevItems = {};
    sale.detalles.forEach(d => {
      initialDevItems[d.producto._id || d.producto] = 0;
    });
    setDevItems(initialDevItems);
    setDevMotivo('');
    setErrorMsg('');
    setDevModal(true);
  };

  const handleDevQtyChange = (prodId, val, maxQty) => {
    const qty = parseInt(val) || 0;
    setDevItems({
      ...devItems,
      [prodId]: Math.min(Math.max(0, qty), maxQty)
    });
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const itemsToReturn = Object.entries(devItems)
      .map(([id_producto, cantidad]) => ({ id_producto, cantidad }))
      .filter(item => item.cantidad > 0);

    if (itemsToReturn.length === 0) {
      setErrorMsg('Debes seleccionar al menos 1 artículo para devolver');
      return;
    }

    if (!devMotivo.trim()) {
      setErrorMsg('El motivo de la devolución es obligatorio');
      return;
    }

    try {
      const payload = {
        id_venta: selectedSale._id,
        motivo: devMotivo.trim(),
        productos: itemsToReturn
      };

      const res = await API.post('/returns', payload);
      if (res.data.ok) {
        showToast('Solicitud de devolución registrada correctamente');
        setDevModal(false);
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al solicitar devolución');
    }
  };

  // Filtrado de Ventas
  const filteredSales = sales.filter(s => {
    const matchDesde = !filterDesde || new Date(s.fecha) >= new Date(filterDesde + 'T00:00:00');
    const matchHasta = !filterHasta || new Date(s.fecha) <= new Date(filterHasta + 'T23:59:59');
    const matchMetodo = !filterMetodo || s.metodo_pago === filterMetodo;
    const matchEstado = !filterEstado || s.estado === filterEstado;
    return matchDesde && matchHasta && matchMetodo && matchEstado;
  });

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  // KPIs
  const totalFacturado = filteredSales
    .filter(s => s.estado === 'Completada')
    .reduce((acc, s) => acc + s.total, 0);
  const totalSalesCount = filteredSales.length;
  const completedCount = filteredSales.filter(s => s.estado === 'Completada').length;
  const canceledCount = filteredSales.filter(s => s.estado === 'Cancelada').length;

  // Filtrar clientes en el buscador de la modal
  const filteredClients = clientSearch.trim() === '' 
    ? [] 
    : clients.filter(c => 
        c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.apellido.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase())
      );

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Facturación de Ventas</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Registro y administración de comprobantes de ventas</p>
          </div>
        </div>
        <button 
          onClick={handleOpenNewSale}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" /> Nueva Venta
        </button>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !newSaleModal && !detailModal && !devModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">${totalFacturado.toLocaleString('es-CO')}</p>
            <p className="text-xs text-slate-500 font-light">Total Facturado (Filtro)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-500/25">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalSalesCount}</p>
            <p className="text-xs text-slate-500 font-light">Total Ventas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
            <p className="text-xs text-slate-500 font-light">Completadas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{canceledCount}</p>
            <p className="text-xs text-slate-500 font-light">Canceladas</p>
          </div>
        </div>

      </div>

      {/* Historial y Filtros */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Historial de Ventas</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Mostrando {filteredSales.length} transacciones registradas</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input 
              type="date" 
              value={filterDesde}
              onChange={(e) => setFilterDesde(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none transition"
              placeholder="Desde"
            />
            <input 
              type="date" 
              value={filterHasta}
              onChange={(e) => setFilterHasta(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none transition"
              placeholder="Hasta"
            />
            <select 
              value={filterMetodo}
              onChange={(e) => setFilterMetodo(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia bancaria">Transferencia</option>
            </select>
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los estados</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"># ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando ventas...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400 font-light">
                    No se encontraron transacciones registradas
                  </td>
                </tr>
              ) : (
                currentItems.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleOpenDetail(s)}>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">#{s._id.substring(18)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(s.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido}` : 'Venta General (Mostrador)'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.empleado?.nombre} {s.empleado?.apellido}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${s.metodo_pago === 'Efectivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {s.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${s.total.toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${s.estado === 'Completada' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetail(s)}
                          title="Ver detalles de venta"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {s.estado === 'Completada' && (
                          <button 
                            onClick={() => handleOpenDev(s)}
                            title="Registrar devolución"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-500 transition"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredSales.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredSales.length)} de {filteredSales.length} resultados</span>
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

      {/* MODAL 1: NUEVA VENTA (ARQUEO Y CARRITO) */}
      {newSaleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Registrar Facturación de Venta
              </h3>
              <button onClick={() => setNewSaleModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              {/* Fila Cliente y Método de Pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Cliente */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente (Opcional)</label>
                  {selectedClient ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{selectedClient.nombre} {selectedClient.apellido}</p>
                        <p className="font-light text-[10px]">{selectedClient.email}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedClient(null)} className="text-blue-500 hover:text-blue-700"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        placeholder="Buscar cliente por nombre..." 
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                      />
                      {filteredClients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto divide-y divide-slate-100">
                          {filteredClients.map(c => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => { setSelectedClient(c); setClientSearch(''); }}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 text-xs font-medium text-slate-700 flex flex-col py-2"
                            >
                              <span>{c.nombre} {c.apellido}</span>
                              <span className="text-[10px] text-slate-400 font-light">{c.email}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Método de Pago *</label>
                  <select 
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia bancaria">Transferencia Bancaria</option>
                  </select>
                  {metodoPago === 'Efectivo' && !activeCaja && (
                    <span className="text-[10px] text-amber-600 font-semibold block mt-1">⚠️ Requiere caja abierta</span>
                  )}
                </div>

              </div>

              {/* Agregar prendas */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seleccionar Prenda para el Carrito</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">Seleccionar prenda...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.nombre} ({p.talla}/{p.color}) — Stock: {p.stock} — ${p.precio_venta.toLocaleString('es-CO')}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Cant."
                    min="1"
                    className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                  <button 
                    type="button"
                    onClick={handleAddToCart}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de Carrito */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Prendas en la Factura</span>
                {cartItems.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-light">
                    El carrito está vacío. Agrega productos arriba.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-semibold text-slate-800 truncate">{item.producto.nombre}</p>
                          <p className="text-slate-400 text-[10px] font-light">Talla {item.producto.talla} / Color {item.producto.color} — Cant: {item.cantidad}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">${(item.cantidad * item.precio_unitario).toLocaleString('es-CO')}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition hover:bg-slate-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex-shrink-0">
                <span className="font-semibold text-slate-700 text-sm">Monto Total a Pagar</span>
                <span className="text-xl font-bold text-blue-600">${calculateTotal().toLocaleString('es-CO')}</span>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setNewSaleModal(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirmSale}
                className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300"
              >
                Confirmar Facturación
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE VENTA */}
      {detailModal && selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">Comprobante de Venta</h3>
              <button onClick={() => setDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Código Transacción:</span> <span className="font-mono font-semibold">#{selectedSale._id}</span></p>
                <p className="flex justify-between"><span>Fecha y Hora:</span> <span className="font-semibold">{new Date(selectedSale.fecha).toLocaleString('es-CO')}</span></p>
                <p className="flex justify-between"><span>Método Pago:</span> <span className="font-semibold">{selectedSale.metodo_pago}</span></p>
                <p className="flex justify-between"><span>Estado:</span> <span className={`font-bold ${selectedSale.estado === 'Completada' ? 'text-green-600' : 'text-red-500'}`}>{selectedSale.estado}</span></p>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Empleado Responsable:</span> <span className="font-medium">{selectedSale.empleado?.nombre} {selectedSale.empleado?.apellido}</span></p>
                <p className="flex justify-between"><span>Cliente Asociado:</span> <span className="font-medium">{selectedSale.cliente ? `${selectedSale.cliente.nombre} ${selectedSale.cliente.apellido}` : 'Venta General'}</span></p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artículos</span>
                {selectedSale.detalles.map((d, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-slate-800">{d.producto?.nombre || 'Prenda'}</p>
                      <p className="text-[10px] text-slate-400 font-light">Talla {d.producto?.talla} / Color {d.producto?.color} — {d.cantidad} ud x ${d.precio_unitario.toLocaleString('es-CO')}</p>
                    </div>
                    <span className="font-bold text-slate-800">${(d.cantidad * d.precio_unitario).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Total Facturado</span>
                <span className="text-blue-600 text-lg">${selectedSale.total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right flex-shrink-0">
              <button onClick={() => setDetailModal(false)} className="px-5 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR DEVOLUCION */}
      {devModal && selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <Undo2 className="w-5 h-5 text-red-500" />
                Registrar Devolución
              </h3>
              <button onClick={() => setDevModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <p className="text-slate-600 font-light mb-4">
                Elige la cantidad de artículos a devolver de la Venta <strong className="font-mono text-slate-800">#{selectedSale._id.substring(18)}</strong>.
              </p>

              {/* Items a devolver */}
              <div className="space-y-3">
                {selectedSale.detalles.map((d, idx) => {
                  const prodId = d.producto._id || d.producto;
                  return (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{d.producto?.nombre || 'Prenda'}</p>
                        <p className="text-[10px] text-slate-400 font-light">Talla {d.producto?.talla} / Color {d.producto?.color} (Comprado: {d.cantidad})</p>
                      </div>
                      <input 
                        type="number" 
                        value={devItems[prodId] || 0}
                        onChange={(e) => handleDevQtyChange(prodId, e.target.value, d.cantidad)}
                        min="0"
                        max={d.cantidad}
                        className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-semibold"
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Motivo de la Devolución *</label>
                <textarea 
                  value={devMotivo}
                  onChange={(e) => setDevMotivo(e.target.value)}
                  placeholder="Detalla el motivo del cambio o reembolso..."
                  required
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6 flex-shrink-0">
                <button type="button" onClick={() => setDevModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition duration-300">Confirmar Devolución</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ventas;
