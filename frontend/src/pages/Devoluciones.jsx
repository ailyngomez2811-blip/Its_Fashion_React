import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Undo2, 
  Search, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Check,
  Ban,
  Clock
} from 'lucide-react';

const Devoluciones = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.rol === 'Administrador';

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  // Modales
  const [detailModal, setDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadReturns = async () => {
    try {
      const res = await API.get('/returns');
      setReturns(res.data);
    } catch (error) {
      console.error('Error al cargar devoluciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
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

  const handleApprove = async (ret) => {
    if (!window.confirm(`¿Estás seguro de APROBAR la devolución de la venta #${ret.venta?._id?.substring(18)}? Esto afectará el stock y registrará un egreso de caja.`)) {
      return;
    }

    try {
      const res = await API.post(`/returns/${ret._id}/approve`);
      if (res.data.ok) {
        showToast('Devolución aprobada exitosamente');
        loadReturns();
        if (selectedReturn?._id === ret._id) {
          setDetailModal(false);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.msg || 'Error al aprobar devolución', false);
    }
  };

  const handleReject = async (ret) => {
    if (!window.confirm(`¿Estás seguro de RECHAZAR la devolución?`)) {
      return;
    }

    try {
      const res = await API.post(`/returns/${ret._id}/reject`);
      if (res.data.ok) {
        showToast('Devolución rechazada');
        loadReturns();
        if (selectedReturn?._id === ret._id) {
          setDetailModal(false);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.msg || 'Error al rechazar devolución', false);
    }
  };

  const handleOpenDetail = (ret) => {
    setSelectedReturn(ret);
    setDetailModal(true);
  };

  // Filtrado
  const filteredReturns = returns.filter(r => {
    const matchDesde = !filterDesde || new Date(r.fecha) >= new Date(filterDesde + 'T00:00:00');
    const matchHasta = !filterHasta || new Date(r.fecha) <= new Date(filterHasta + 'T23:59:59');
    const matchEstado = !filterEstado || r.estado === filterEstado;
    return matchDesde && matchHasta && matchEstado;
  });

  // KPIs
  const totalDevs = filteredReturns.length;
  const pendingDevs = filteredReturns.filter(r => r.estado === 'Pendiente').length;
  const approvedDevs = filteredReturns.filter(r => r.estado === 'Aceptada').length;
  const rejectedDevs = filteredReturns.filter(r => r.estado === 'Rechazada').length;

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Undo2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Control de Devoluciones</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Administración de devoluciones y reembolsos de prendas</p>
          </div>
        </div>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !detailModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-blue-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Undo2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalDevs}</p>
            <p className="text-xs text-slate-500 font-light">Total Solicitudes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{pendingDevs}</p>
            <p className="text-xs text-slate-500 font-light">Pendientes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{approvedDevs}</p>
            <p className="text-xs text-slate-500 font-light">Aceptadas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 stat-card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{rejectedDevs}</p>
            <p className="text-xs text-slate-500 font-light">Rechazadas</p>
          </div>
        </div>

      </div>

      {/* Historial */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Solicitudes de Devolución</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Control de cambios de mercadería y reembolsos</p>
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
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none transition"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aceptada">Aceptada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Venta</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reembolso</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando devoluciones...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400 font-light">
                    No se encontraron registros de devolución
                  </td>
                </tr>
              ) : (
                filteredReturns.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(r.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      #{r.venta?._id?.substring(18) || r.venta}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : 'Venta General (Mostrador)'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${r.monto_devuelto.toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        r.estado === 'Aceptada' ? 'bg-green-50 text-green-700 border border-green-200' :
                        r.estado === 'Rechazada' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetail(r)}
                          title="Ver detalle"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && r.estado === 'Pendiente' && (
                          <>
                            <button 
                              onClick={() => handleApprove(r)}
                              title="Aceptar Devolución"
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(r)}
                              title="Rechazar Devolución"
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: DETALLE DE DEVOLUCION */}
      {detailModal && selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">Detalle de Devolución</h3>
              <button onClick={() => setDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Código Devolución:</span> <span className="font-mono font-semibold">#{selectedReturn._id}</span></p>
                <p className="flex justify-between"><span>Fecha:</span> <span className="font-semibold">{new Date(selectedReturn.fecha).toLocaleString('es-CO')}</span></p>
                <p className="flex justify-between"><span>Venta de Origen:</span> <span className="font-mono font-semibold">#{selectedReturn.venta?._id || selectedReturn.venta}</span></p>
                <p className="flex justify-between"><span>Estado:</span> <span className="font-bold">{selectedReturn.estado}</span></p>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-3">
                <p className="flex justify-between"><span>Cliente:</span> <span className="font-medium">{selectedReturn.cliente ? `${selectedReturn.cliente.nombre} ${selectedReturn.cliente.apellido}` : 'Venta General'}</span></p>
                <p className="flex justify-between"><span>Motivo:</span> <span className="font-light italic text-slate-500">"{selectedReturn.motivo}"</span></p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artículos Devueltos</span>
                {selectedReturn.productos.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-slate-800">{p.producto?.nombre || 'Prenda'}</p>
                      <p className="text-[10px] text-slate-400 font-light">Talla {p.producto?.talla} / Color {p.producto?.color} — {p.cantidad} ud x ${p.precio_unitario?.toLocaleString('es-CO')}</p>
                    </div>
                    <span className="font-bold text-slate-800">${(p.cantidad * (p.precio_unitario || 0)).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Total Reembolsado</span>
                <span className="text-blue-600 text-lg">${selectedReturn.monto_devuelto.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex gap-2">
                {isAdmin && selectedReturn.estado === 'Pendiente' && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedReturn)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      Aceptar
                    </button>
                    <button 
                      onClick={() => handleReject(selectedReturn)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => setDetailModal(false)} className="px-5 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Devoluciones;
