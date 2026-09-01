import React, { useState, useEffect } from 'react';

import API from '../../services/api';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  Truck,
  PlusCircle
} from 'lucide-react';

const Compras = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeCaja, setActiveCaja] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [newPurchaseModal, setNewPurchaseModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Form states
  const [idProveedor, setIdProveedor] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cartItems, setCartItems] = useState([]);
  
  // Agregar item form
  const [selectedProdId, setSelectedProdId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [costPrice, setCostPrice] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [purchRes, prodRes, suppRes, activeCajaRes] = await Promise.all([
        API.get('/purchases'),
        API.get('/products'),
        API.get('/suppliers'),
        API.get('/cash-registers/active')
      ]);

      setPurchases(purchRes.data);
      setProducts(prodRes.data.filter(p => p.estado === 'Activo'));
      setSuppliers(suppRes.data.filter(s => s.estado === 'Activo'));
      if (activeCajaRes.data.ok) {
        setActiveCaja(activeCajaRes.data.active);
      } else {
        setActiveCaja(null);
      }
    } catch (error) {
      console.error('Error al cargar abastecimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDesde, filterHasta, filterProveedor]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenNewPurchase = () => {
    setCartItems([]);
    setIdProveedor('');
    setMetodoPago('Efectivo');
    setSelectedProdId('');
    setQuantity('1');
    setCostPrice('');
    setErrorMsg('');
    setNewPurchaseModal(true);
  };

  const handleAddToCart = () => {
    setErrorMsg('');
    if (!selectedProdId) {
      setErrorMsg('Selecciona un producto');
      return;
    }
    const qtyVal = parseInt(quantity);
    const costVal = parseFloat(costPrice);

    if (isNaN(qtyVal) || qtyVal <= 0) {
      setErrorMsg('La cantidad debe ser un número entero positivo');
      return;
    }
    if (isNaN(costVal) || costVal <= 0) {
      setErrorMsg('El precio de compra debe ser un número positivo');
      return;
    }

    const prod = products.find(p => p._id === selectedProdId);
    if (!prod) return;

    // Verificar si ya está en el carrito
    const existing = cartItems.find(item => item.producto._id === prod._id);
    if (existing) {
      setErrorMsg('Este producto ya fue agregado al carrito. Elimínalo si deseas cambiar su cantidad o costo.');
      return;
    }

    setCartItems([...cartItems, { producto: prod, cantidad: qtyVal, precio_compra: costVal }]);
    setSelectedProdId('');
    setQuantity('1');
    setCostPrice('');
  };

  const handleRemoveFromCart = (idx) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_compra), 0);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idProveedor) {
      setErrorMsg('Selecciona un proveedor');
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg('Agrega al menos una prenda al carrito');
      return;
    }
    if (metodoPago === 'Efectivo' && !activeCaja) {
      setErrorMsg('No hay una caja abierta. Abre la caja registradora para registrar egresos en efectivo.');
      return;
    }

    const payload = {
      id_proveedor: idProveedor,
      metodo_pago: metodoPago,
      detalles: cartItems.map(item => ({
        id_producto: item.producto._id,
        cantidad: item.cantidad,
        precio_compra: item.precio_compra
      }))
    };

    try {
      const res = await API.post('/purchases', payload);
      if (res.data.ok) {
        showToast('Abastecimiento registrado correctamente');
        setNewPurchaseModal(false);
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al procesar abastecimiento');
    }
  };

  const handleOpenDetail = (purch) => {
    setSelectedPurchase(purch);
    setDetailModal(true);
  };

  // Filtrado de compras
  const filteredPurchases = purchases.filter(p => {
    const matchDesde = !filterDesde || new Date(p.fecha) >= new Date(filterDesde + 'T00:00:00');
    const matchHasta = !filterHasta || new Date(p.fecha) <= new Date(filterHasta + 'T23:59:59');
    const matchProv = !filterProveedor || (p.proveedor?._id || p.proveedor) === filterProveedor;
    return matchDesde && matchHasta && matchProv;
  });

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  // KPIs
  const totalInvertido = filteredPurchases.reduce((acc, p) => acc + p.total, 0);
  const totalCount = filteredPurchases.length;

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Abastecimiento (Compras)</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Registro de compras de mercadería a proveedores</p>
          </div>
        </div>
        <button 
          onClick={handleOpenNewPurchase}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" /> Nueva Compra
        </button>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !newPurchaseModal && !detailModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">${totalInvertido.toLocaleString('es-CO')}</p>
            <p className="text-xs text-slate-500 font-light">Inversión Total (Filtro)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-500/25">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            <p className="text-xs text-slate-500 font-light">Órdenes de Compra</p>
          </div>
        </div>

      </div>

      {/* Historial y Filtros */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Órdenes de Abastecimiento</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Historial de entradas de stock</p>
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
              value={filterProveedor}
              onChange={(e) => setFilterProveedor(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"># ID Compra</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando compras...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-light">
                    No se encontraron compras en el historial
                  </td>
                </tr>
              ) : (
                currentItems.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleOpenDetail(p)}>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">#{p._id.substring(18)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(p.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-semibold">{p.proveedor?.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${p.metodo_pago === 'Efectivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {p.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${p.total.toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.usuario?.nombre} {p.usuario?.apellido}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenDetail(p)}
                        title="Ver detalle"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredPurchases.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPurchases.length)} de {filteredPurchases.length} resultados</span>
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

      {/* MODAL 1: REGISTRAR COMPRA */}
      {newPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Registrar Abastecimiento
              </h3>
              <button onClick={() => setNewPurchaseModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              {/* Fila Proveedor y Método de Pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Proveedor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Proveedor *</label>
                  <select 
                    value={idProveedor}
                    onChange={(e) => setIdProveedor(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">Selecciona proveedor</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.nombre} (NIT: {s.nit_rut})</option>
                    ))}
                  </select>
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
                    <span className="text-[10px] text-amber-600 font-semibold block mt-1">⚠️ Requiere caja abierta (Se registrará un egreso)</span>
                  )}
                </div>

              </div>

              {/* Agregar producto */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Añadir Prenda a la Orden</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select 
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="sm:col-span-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Selecciona prenda...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.nombre} ({p.talla}/{p.color}) — Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Cantidad"
                    min="1"
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="Precio Compra ($)"
                      min="0.01"
                      step="0.01"
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                      type="button"
                      onClick={handleAddToCart}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Carrito */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Prendas Compradas</span>
                {cartItems.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-light">
                    Agrega los artículos que ingresarán al almacén.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-semibold text-slate-800 truncate">{item.producto.nombre}</p>
                          <p className="text-slate-400 text-[10px] font-light">Talla {item.producto.talla} / Color {item.producto.color} — Cant: {item.cantidad} x ${item.precio_compra.toLocaleString('es-CO')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">${(item.cantidad * item.precio_compra).toLocaleString('es-CO')}</span>
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
                <span className="font-semibold text-slate-700 text-sm">Costo Total de Abastecimiento</span>
                <span className="text-xl font-bold text-blue-600">${calculateTotal().toLocaleString('es-CO')}</span>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setNewPurchaseModal(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirmPurchase}
                className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300"
              >
                Confirmar Compra
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE COMPRA */}
      {detailModal && selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">Detalle de Compra</h3>
              <button onClick={() => setDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Código Transacción:</span> <span className="font-mono font-semibold">#{selectedPurchase._id}</span></p>
                <p className="flex justify-between"><span>Fecha y Hora:</span> <span className="font-semibold">{new Date(selectedPurchase.fecha).toLocaleString('es-CO')}</span></p>
                <p className="flex justify-between"><span>Método Pago:</span> <span className="font-semibold">{selectedPurchase.metodo_pago}</span></p>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Proveedor:</span> <span className="font-bold text-slate-850">{selectedPurchase.proveedor?.nombre}</span></p>
                <p className="flex justify-between"><span>Comprador:</span> <span className="font-medium">{selectedPurchase.usuario?.nombre} {selectedPurchase.usuario?.apellido}</span></p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artículos Ingresados</span>
                {selectedPurchase.detalles.map((d, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-slate-800">{d.producto?.nombre || 'Prenda'}</p>
                      <p className="text-[10px] text-slate-400 font-light">Talla {d.producto?.talla} / Color {d.producto?.color} — {d.cantidad} ud x ${d.precio_compra.toLocaleString('es-CO')}</p>
                    </div>
                    <span className="font-bold text-slate-800">${(d.cantidad * d.precio_compra).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Inversión Total</span>
                <span className="text-blue-600 text-lg">${selectedPurchase.total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right flex-shrink-0">
              <button onClick={() => setDetailModal(false)} className="px-5 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Compras;
