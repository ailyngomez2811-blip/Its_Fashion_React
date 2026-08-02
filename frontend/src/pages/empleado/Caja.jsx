import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  X
} from 'lucide-react';

const Caja = () => {
  const [activeCaja, setActiveCaja] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [movModalOpen, setMovModalOpen] = useState(false);

  // Form states
  const [saldoInicial, setSaldoInicial] = useState('');
  const [saldoFinal, setSaldoFinal] = useState('');
  const [justificacion, setJustificacion] = useState('');
  
  const [movData, setMovData] = useState({
    tipo: 'Ingreso',
    monto: '',
    concepto: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [activeRes, histRes] = await Promise.all([
        API.get('/cash-registers/active'),
        API.get('/cash-registers/history')
      ]);
      if (activeRes.data.ok) {
        setActiveCaja(activeRes.data.active);
      }
      setHistory(histRes.data);
    } catch (error) {
      console.error('Error al cargar datos de caja:', error);
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

  const handleOpenCaja = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const val = parseFloat(saldoInicial);

    if (isNaN(val) || val < 0) {
      setErrorMsg('El saldo inicial no puede ser negativo o nulo');
      return;
    }

    try {
      const res = await API.post('/cash-registers/open', { saldo_inicial: val });
      if (res.data.ok) {
        showToast('Caja abierta correctamente');
        setOpenModalOpen(false);
        setSaldoInicial('');
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al abrir caja');
    }
  };

  const handleCloseCaja = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const sFinal = parseFloat(saldoFinal);

    if (isNaN(sFinal) || sFinal < 0) {
      setErrorMsg('El saldo final es obligatorio y no puede ser negativo');
      return;
    }

    const saldoTeorico = activeCaja.saldo_inicial + activeCaja.total_ingresos - activeCaja.total_egresos;
    const dif = sFinal - saldoTeorico;

    if (dif !== 0 && !justificacion.trim()) {
      setErrorMsg('La justificación es obligatoria cuando hay diferencia.');
      return;
    }

    try {
      const res = await API.post('/cash-registers/close', {
        id_caja: activeCaja._id,
        saldo_final: sFinal,
        justificacion: justificacion.trim()
      });
      if (res.data.ok) {
        showToast('Caja cerrada correctamente');
        setCloseModalOpen(false);
        setSaldoFinal('');
        setJustificacion('');
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al cerrar caja');
    }
  };

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const amt = parseFloat(movData.monto);

    if (isNaN(amt) || amt <= 0 || !movData.concepto.trim()) {
      setErrorMsg('Completa todos los campos obligatorios con valores válidos');
      return;
    }

    try {
      const res = await API.post('/cash-registers/movement', {
        id_caja: activeCaja._id,
        tipo: movData.tipo,
        monto: amt,
        concepto: movData.concepto.trim()
      });
      if (res.data.ok) {
        showToast('Movimiento registrado correctamente');
        setMovModalOpen(false);
        setMovData({ tipo: 'Ingreso', monto: '', concepto: '' });
        loadData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al registrar movimiento');
    }
  };

  const activeSaldoTeorico = activeCaja 
    ? activeCaja.saldo_inicial + activeCaja.total_ingresos - activeCaja.total_egresos 
    : 0;

  // Paginación de Historial de Turnos
  const itemsPerPage = 8;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Control de Caja</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Aperturas, cierres y arqueos de caja física</p>
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
      {errorMsg && !openModalOpen && !closeModalOpen && !movModalOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !activeCaja ? (
        
        /* CAJA CERRADA - BIENVENIDA / APERTURA */
        <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-3xl p-8 shadow-lg text-center space-y-6 mt-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-slate-800">La caja está Cerrada</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed">
              Debes abrir la caja inicializando el saldo para poder registrar ventas en efectivo y movimientos diarios.
            </p>
          </div>
          <button 
            onClick={() => { setErrorMsg(''); setOpenModalOpen(true); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition duration-300 flex items-center justify-center gap-2"
          >
            <Unlock className="w-5 h-5" /> Abrir Caja de Turno
          </button>
        </div>

      ) : (

        /* CAJA ABIERTA - INTERFAZ OPERATIVA */
        <div className="space-y-6">
          
          {/* Ficha Resumen de Caja */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Saldo Inicial e Ingresos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dinero Disponible</span>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-800">${activeSaldoTeorico.toLocaleString('es-CO')}</h3>
                <p className="text-xs text-slate-400 font-light">Saldo Teórico del turno</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Saldo Inicial</span>
                  <p className="font-semibold text-slate-700 text-sm">${activeCaja.saldo_inicial.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Responsable</span>
                  <p className="font-semibold text-slate-700 text-xs truncate">
                    {activeCaja.usuario?.nombre} {activeCaja.usuario?.apellido}
                  </p>
                </div>
              </div>
            </div>

            {/* Arqueo Detallado de Ingresos y Egresos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-6 h-full items-center">
                <div className="space-y-2 border-r border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Ingresos
                  </span>
                  <h4 className="text-xl font-bold text-slate-800">+${activeCaja.total_ingresos.toLocaleString('es-CO')}</h4>
                </div>
                <div className="space-y-2 pl-4">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Egresos
                  </span>
                  <h4 className="text-xl font-bold text-slate-800">-${activeCaja.total_egresos.toLocaleString('es-CO')}</h4>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-light border-t border-slate-100 pt-2 flex items-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Apertura: {new Date(activeCaja.fecha_apertura).toLocaleString('es-CO')}
              </div>
            </div>

            {/* Acciones de Caja */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-center gap-3">
              <button 
                onClick={() => { setErrorMsg(''); setMovModalOpen(true); }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
              >
                Registrar Movimiento manual
              </button>
              <button 
                onClick={() => { setErrorMsg(''); setCloseModalOpen(true); }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-red-600/25"
              >
                Cerrar Caja de Turno
              </button>
            </div>

          </div>

          {/* Historial de Movimientos de la Caja Actual */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 font-serif">Movimientos de la Caja Activa</h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Arqueo de ingresos y egresos registrados durante el turno</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCaja.movimientos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-light text-sm">
                        No se han registrado movimientos durante esta apertura.
                      </td>
                    </tr>
                  ) : (
                    activeCaja.movimientos.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-slate-500 text-xs font-light">
                          {new Date(m.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            m.tipo === 'Ingreso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {m.concepto}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          ${m.monto.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      )}

      {/* Historial General de Cierres de Caja */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Historial de Turnos de Caja</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Últimos 50 cierres registrados en el sistema</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Apertura</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cierre</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicial</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Final</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Arqueo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-light">
                    No hay cierres registrados en el historial
                  </td>
                </tr>
              ) : (
                currentItems.map(h => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500 text-xs font-light">
                      {new Date(h.fecha_apertura).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-light">
                      {h.fecha_cierre ? new Date(h.fecha_cierre).toLocaleString('es-CO') : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {h.usuario?.nombre} {h.usuario?.apellido}
                    </td>
                    <td className="px-6 py-4 font-medium">${h.saldo_inicial.toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4 font-medium">{h.saldo_final !== undefined ? `$${h.saldo_final.toLocaleString('es-CO')}` : '—'}</td>
                    <td className="px-6 py-4">
                      {h.diferencia !== undefined ? (
                        <span className={`font-bold ${h.diferencia === 0 ? 'text-green-600' : 'text-red-500'}`}>
                          ${h.diferencia.toLocaleString('es-CO')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        h.estado === 'Abierta' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {h.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {history.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, history.length)} de {history.length} resultados</span>
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

      {/* MODAL 1: ABRIR CAJA */}
      {openModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-blue-600" />
                Apertura de Caja
              </h3>
              <button onClick={() => setOpenModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleOpenCaja} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Saldo Inicial ($) *</label>
                <input 
                  type="number" 
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setOpenModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CERRAR CAJA */}
      {closeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Cierre de Caja
              </h3>
              <button onClick={() => setCloseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCloseCaja} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm space-y-2 text-slate-600">
                <p className="flex justify-between"><span>Saldo Inicial:</span> <span className="font-semibold">${activeCaja.saldo_inicial.toLocaleString('es-CO')}</span></p>
                <p className="flex justify-between"><span>Ingresos del turno:</span> <span className="font-semibold text-green-600">+${activeCaja.total_ingresos.toLocaleString('es-CO')}</span></p>
                <p className="flex justify-between"><span>Egresos del turno:</span> <span className="font-semibold text-red-500">-${activeCaja.total_egresos.toLocaleString('es-CO')}</span></p>
                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-slate-800">
                  <span>Saldo Teórico:</span> <span>${activeSaldoTeorico.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Saldo Final en Caja ($) *</label>
                <input 
                  type="number" 
                  value={saldoFinal}
                  onChange={(e) => setSaldoFinal(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white animate-pulse"
                />
              </div>
              
              {/* Justificación obligatoria si hay diferencia */}
              {saldoFinal !== '' && parseFloat(saldoFinal) !== activeSaldoTeorico && (
                <div className="animate-scale-up">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Justificación del Desajuste *</label>
                  <textarea 
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    placeholder="Justifica el faltante o sobrante de efectivo en caja..."
                    required
                    rows="3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  ></textarea>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setCloseModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition duration-300">Cerrar y Archivar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR MOVIMIENTO MANUAL */}
      {movModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Movimiento Manual de Efectivo
              </h3>
              <button onClick={() => setMovModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRegisterMovement} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo de Movimiento</label>
                <select 
                  value={movData.tipo}
                  onChange={(e) => setMovData({ ...movData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Ingreso">Ingreso (+)</option>
                  <option value="Egreso">Egreso (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monto ($) *</label>
                <input 
                  type="number" 
                  value={movData.monto}
                  onChange={(e) => setMovData({ ...movData, monto: e.target.value })}
                  placeholder="0.00"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Concepto / Justificación *</label>
                <input 
                  type="text" 
                  value={movData.concepto}
                  onChange={(e) => setMovData({ ...movData, concepto: e.target.value })}
                  placeholder="Ej: Pago de flete a mensajería"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setMovModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">Registrar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Caja;
