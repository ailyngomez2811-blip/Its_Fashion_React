import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertCircle, 
  TrendingUp,
  Undo2
} from 'lucide-react';

const EmpleadoDashboard = () => {
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
        console.error('Error al cargar estadísticas de empleado:', error);
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

  const devCount = stats?.devoluciones?.pendientes || 0;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="mb-2">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-1">
          Bienvenido, {user?.nombre}
        </h2>
        <p className="text-sm text-slate-500 font-light">
          Este es tu panel de trabajo. Tienes acceso a ventas, compras, inventario y caja.
        </p>
      </div>

      {/* Banner Devoluciones Pendientes */}
      {devCount > 0 && (
        <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Undo2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-amber-800">
              {devCount} {devCount === 1 ? 'devolución pendiente' : 'devoluciones pendientes'} de revisión
            </p>
            <p className="text-sm text-amber-700 font-light mt-0.5">Notifica a tu supervisor para gestionar las solicitudes.</p>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Ventas Hoy */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas de Hoy</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.ventas?.hoy || 0}
            </h3>
            <p className="text-xs text-slate-500 font-light">Registradas el día de hoy</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Ingresos del Mes */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos del Mes</span>
            <h3 className="text-2xl font-bold text-slate-800">
              ${stats?.ventas?.total?.toLocaleString('es-CO') || '0.00'}
            </h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-light">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats?.ventas?.completadas || 0} concretadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Prendas Activas */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prendas Activas</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.productos?.total || 0}
            </h3>
            <p className="text-xs text-slate-500 font-light">En catálogo boutique</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Devoluciones */}
        <div className="stat-card p-6 rounded-[1.5rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devoluciones</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {devCount}
            </h3>
            <p className="text-xs text-slate-500 font-light">En espera de revisión</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Undo2 className="w-6 h-6" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmpleadoDashboard;
