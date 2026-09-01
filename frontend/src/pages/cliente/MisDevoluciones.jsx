import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  Undo2, 
  Search, 
  X, 
  Eye,
  Clock,
  Check
} from 'lucide-react';

const MisDevoluciones = () => {
  const { user } = useContext(AuthContext);
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await API.get('/returns');
      // Filtrar por cliente
      const clientReturns = res.data.filter(r => 
        r.cliente === user?.id || 
        r.cliente?._id === user?.id || 
        r.venta?.cliente === user?.id || 
        r.venta?.cliente?._id === user?.id
      );
      setReturnsList(clientReturns);
    } catch (error) {
      console.error('Error al cargar devoluciones del cliente:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleOpenDetail = (ret) => {
    setSelectedReturn(ret);
    setDetailModal(true);
  };

  const filteredReturns = returnsList.filter(r => 
    r._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);

  const pendingCount = returnsList.filter(r => r.estado === 'Pendiente').length;
  const acceptedTotal = returnsList
    .filter(r => r.estado === 'Aceptada')
    .reduce((acc, r) => acc + (r.total_devolucion ?? r.monto_devuelto ?? 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Undo2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Mis Devoluciones</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Historial de solicitudes de devoluciones y reembolsos</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{pendingCount}</p>
            <p className="text-xs text-slate-500 font-light">En revisión</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Undo2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{returnsList.length}</p>
            <p className="text-xs text-slate-500 font-light">Solicitudes totales</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-700">${acceptedTotal.toLocaleString('es-CO')}</p>
            <p className="text-xs text-slate-500 font-light">Monto reintegrado</p>
          </div>
        </div>
      </div>

      {/* Alerta de Pendientes */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-light">
          Tienes solicitudes de devolución actualmente en revisión por la administración.
        </div>
      )}

      {/* Tabla de Historial */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Mis Solicitudes</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Estado de resolución de devoluciones</p>
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Solicitud</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Venta Original</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Solicitud</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando devoluciones...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-light">
                    No has solicitado ninguna devolución hasta el momento.
                  </td>
                </tr>
              ) : (
                currentItems.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">#{r._id.substring(18)}</td>
                    <td className="px-6 py-4 text-xs font-mono text-blue-600">
                      #{r.venta?._id?.substring(18) || r.venta?.substring(18) || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(r.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-slate-700 truncate max-w-xs" title={r.motivo}>
                      {r.motivo}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${(r.total_devolucion ?? r.monto_devuelto ?? 0).toLocaleString('es-CO')}</td>
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
                      <button 
                        onClick={() => handleOpenDetail(r)}
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
        {filteredReturns.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReturns.length)} de {filteredReturns.length} resultados</span>
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

      {/* MODAL DETALLE DEVOLUCION */}
      {detailModal && selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Detalle Devolución #{selectedReturn._id.substring(18)}
              </h3>
              <button onClick={() => setDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-light">Fecha Solicitud</span>
                  <span className="font-semibold text-slate-700">{new Date(selectedReturn.fecha).toLocaleString('es-CO')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-light">Resolución Estado</span>
                  <span className={`font-semibold ${selectedReturn.estado === 'Aceptada' ? 'text-green-600' : selectedReturn.estado === 'Rechazada' ? 'text-red-500' : 'text-amber-600'}`}>{selectedReturn.estado}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-slate-400 block font-light">Motivo Declarado</span>
                <p className="text-slate-700 font-medium italic">"{selectedReturn.motivo}"</p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-semibold text-slate-800 text-sm mb-2">Artículos Devueltos</h4>
                <div className="space-y-3">
                  {(selectedReturn.detalles || selectedReturn.productos || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{item.producto?.nombre || 'Producto'}</p>
                        <p className="text-slate-400 font-light">Talla {item.producto?.talla} / Color {item.producto?.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">{item.cantidad} uds</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center font-bold text-sm text-slate-800">
                <span>Monto Reintegrado:</span>
                <span>${(selectedReturn.total_devolucion ?? selectedReturn.monto_devuelto ?? 0).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MisDevoluciones;
