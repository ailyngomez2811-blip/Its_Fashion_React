import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Warehouse, 
  Coins, 
  LogOut 
} from 'lucide-react';

const EmpleadoSidebar = ({ logout, iniciales, usuario }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Brand */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-serif text-white font-bold">
          IF
        </div>
        <span className="font-serif text-xl font-bold tracking-wide">
          Its <span className="text-blue-500">Fashion</span>
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">
          Principal
        </p>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 
            `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/15 text-blue-400 border-r-3 border-blue-600 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </NavLink>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mt-6 mb-2">
          Operaciones
        </p>
        <NavLink
          to="/ventas"
          className={({ isActive }) => 
            `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/15 text-blue-400 border-r-3 border-blue-600 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`
          }
        >
          <ShoppingCart className="w-5 h-5" /> Ventas
        </NavLink>
        <NavLink
          to="/compras"
          className={({ isActive }) => 
            `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/15 text-blue-400 border-r-3 border-blue-600 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`
          }
        >
          <Truck className="w-5 h-5" /> Compras
        </NavLink>
        <NavLink
          to="/inventario"
          className={({ isActive }) => 
            `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/15 text-blue-400 border-r-3 border-blue-600 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`
          }
        >
          <Warehouse className="w-5 h-5" /> Inventario
        </NavLink>
        <NavLink
          to="/caja"
          className={({ isActive }) => 
            `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/15 text-blue-400 border-r-3 border-blue-600 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`
          }
        >
          <Coins className="w-5 h-5" /> Caja
        </NavLink>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario}</p>
            <p className="text-xs text-slate-400">Empleado</p>
          </div>
          <button 
            onClick={logout} 
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-400 transition-colors p-2 focus:outline-none"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoSidebar;
