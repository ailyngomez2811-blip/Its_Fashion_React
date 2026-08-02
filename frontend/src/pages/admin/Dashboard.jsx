import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Coins,
  Undo2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/reports/dashboard');
        if (res.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de Bienvenida */}
      <div className="mb-2">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-1">
          Bienvenido, {user?.nombre} {user?.apellido}
        </h2>
        <p className="text-sm text-slate-500 font-light">
          Aquí tienes un resumen de la actividad comercial de tu boutique.
        </p>
      </div>

      {/* Grid de Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Ventas Totales */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</span>
            <h3 className="text-2xl font-bold text-slate-800">
              ${stats?.ventas?.total?.toLocaleString('es-CO') || '0.00'}
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1 font-light">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats?.ventas?.completadas || 0} completadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Ventas Hoy */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas de Hoy</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.ventas?.hoy || 0}
            </h3>
            <p className="text-xs text-slate-500 font-light">Registradas el día de hoy</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Stock de Productos */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos en Catálogo</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.productos?.total || 0}
            </h3>
            <p className="text-xs text-slate-500 font-light">
              Total stock: {stats?.productos?.stock || 0} uds.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Clientes */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Registrados</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.clientes?.total || 0}
            </h3>
            <p className="text-xs text-slate-500 font-light">Registrados en la plataforma</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Grid de Estado de Operaciones (Caja Activa y Devoluciones) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Caja Activa Status Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-500" />
              Estado de la Caja Registradora
            </h3>
            {stats?.cajaActiva ? (
              <span className="badge bg-green-50 text-green-700 border border-green-200">Abierta</span>
            ) : (
              <span className="badge bg-red-50 text-red-700 border border-red-200">Cerrada</span>
            )}
          </div>

          {stats?.cajaActiva ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Responsable</span>
                  <p className="text-sm font-semibold text-slate-700">{stats.cajaActiva.responsable}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Saldo Inicial</span>
                  <p className="text-sm font-semibold text-slate-700">
                    ${stats.cajaActiva.saldo_inicial.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Apertura: {new Date(stats.cajaActiva.fecha_apertura).toLocaleString('es-CO')}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-500 font-light">
                La caja se encuentra cerrada. Debes abrirla en la sección de Caja para poder facturar.
              </p>
            </div>
          )}
        </div>

        {/* Devoluciones Pendientes Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-serif text-lg font-bold text-slate-800">Alertas de Operaciones</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              stats?.devoluciones?.pendientes > 0 ? 'bg-amber-50 text-amber-500 animate-bounce' : 'bg-slate-50 text-slate-400'
            }`}>
              <Undo2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">
              {stats?.devoluciones?.pendientes || 0}
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Solicitudes de devolución pendientes
            </p>
          </div>

          {stats?.devoluciones?.pendientes > 0 && (
            <div className="mt-4">
              <a 
                href="/devoluciones" 
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                Revisar Solicitudes
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
