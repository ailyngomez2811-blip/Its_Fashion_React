import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  ShoppingBag, 
  Search, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Undo2
} from 'lucide-react';

const MisCompras = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [detailModal, setDetailModal] = useState(false);
  const [devModal, setDevModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Devolución form
  const [devItems, setDevItems] = useState({});
  const [devMotivo, setDevMotivo] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [returnsList, setReturnsList] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [salesRes, returnsRes] = await Promise.all([
        API.get('/sales'),
        API.get('/returns')
      ]);
      // Filtrar las compras que pertenecen al cliente logueado
      const clientSales = salesRes.data.filter(s => 
        s.cliente === user?.id || 
        s.cliente?._id === user?.id
      );
      // Filtrar las devoluciones del cliente logueado
      const clientReturns = returnsRes.data.filter(r =>
        r.usuario === user?.id ||
        r.usuario?._id === user?.id ||
        r.venta?.cliente === user?.id ||
        r.venta?.cliente?._id === user?.id
      );
      setSales(clientSales);
      setReturnsList(clientReturns);
    } catch (error) {
      console.error('Error al cargar compras del cliente:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Retorna las devoluciones asociadas a una venta
  const getReturnsBySale = (saleId) => {
    return returnsList.filter(r => r.venta?._id === saleId || r.venta === saleId);
  };

  // Calcula el total a devolver en base a los items seleccionados
  const calcDevTotal = () => {
    if (!selectedSale) return 0;
    return selectedSale.detalles.reduce((acc, det) => {
      const prodId = det.producto?._id || det.producto;
      const qty = devItems[prodId] || 0;
      return acc + qty * det.precio_unitario;
    }, 0);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
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

  const filteredSales = sales.filter(s => 
    s._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  const totalGastado = sales
    .filter(s => s.estado === 'Completada')
    .reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Mis Compras</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Historial completo de tus compras en la boutique</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
          Total invertido: ${totalGastado.toLocaleString('es-CO')}
        </div>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !devModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Tabla de Compras */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Mis Pedidos</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Listado de transacciones registradas</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"># ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando compras...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400 font-light">
                    No tienes compras registradas aún.
                  </td>
                </tr>
              ) : (
                currentItems.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">#{s._id.substring(18)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(s.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${s.metodo_pago === 'Efectivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {s.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${s.total.toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`badge ${s.estado === 'Completada' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {s.estado}
                        </span>
                        {/* CL0003: Indicador visual si la compra tiene devoluciones */}
                        {getReturnsBySale(s._id).length > 0 && (
                          <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                            <Undo2 className="w-2.5 h-2.5 mr-0.5 inline" />
                            {getReturnsBySale(s._id).length === 1 ? 'Devolución' : `${getReturnsBySale(s._id).length} devoluciones`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetail(s)}
                          title="Ver detalle"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {s.estado === 'Completada' && (
                          <button 
                            onClick={() => handleOpenDev(s)}
                            title="Solicitar Devolución"
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

      {/* MODAL: DETALLE COMPRA */}
      {detailModal && selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Detalle de Compra #{selectedSale._id.substring(18)}
              </h3>
              <button onClick={() => setDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-light">Fecha de Registro</span>
                  <span className="font-semibold text-slate-700">{new Date(selectedSale.fecha).toLocaleString('es-CO')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-light">Método de Pago</span>
                  <span className="font-semibold text-slate-700">{selectedSale.metodo_pago}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-800 text-sm mb-2">Artículos Facturados</h4>
                <div className="space-y-3">
                  {selectedSale.detalles.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{det.producto?.nombre || 'Producto'}</p>
                        <p className="text-slate-400 font-light">Talla {det.producto?.talla} / Color {det.producto?.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">{det.cantidad} x ${det.precio_unitario.toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center font-bold text-sm text-slate-800">
                <span>Total Facturado:</span>
                <span>${selectedSale.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR DEVOLUCION */}
      {devModal && selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Solicitar Devolución
              </h3>
              <button onClick={() => setDevModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleConfirmReturn} className="p-6 overflow-y-auto flex-1 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Selecciona la cantidad de cada artículo que deseas devolver. Toda solicitud quedará sujeta a la aprobación de la administración.
              </p>

              <div className="space-y-3 pt-2">
                {selectedSale.detalles.map((det, idx) => {
                  const prodId = det.producto?._id || det.producto;
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{det.producto?.nombre}</p>
                        <p className="text-slate-400 font-light">Talla {det.producto?.talla} / Color {det.producto?.color}</p>
                        <p className="text-blue-600 font-semibold mt-1">Comprado: {det.cantidad} uds</p>
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          min="0"
                          max={det.cantidad}
                          value={devItems[prodId] || 0}
                          onChange={(e) => handleDevQtyChange(prodId, e.target.value, det.maxQty || det.cantidad)}
                          className="w-full text-center px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Motivo de Devolución *</label>
                <textarea 
                  rows="3"
                  value={devMotivo}
                  onChange={(e) => setDevMotivo(e.target.value)}
                  placeholder="Ej: La prenda tiene una costura suelta / no le quedó la talla"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* CL0004: Total calculado de la devolución */}
              {calcDevTotal() > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-sm font-bold text-amber-800">
                  <span>Total a devolver:</span>
                  <span>${calcDevTotal().toLocaleString('es-CO')}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setDevModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition duration-300">
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MisCompras;
