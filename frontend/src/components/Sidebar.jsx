import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Package, 
  Tags, 
  ShoppingCart, 
  Truck, 
  Warehouse, 
  Undo2, 
  Coins, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const iniciales = user.nombre && user.apellido 
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'US';

  const menuItems = [
    {
      title: 'Principal',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Empleado'] },
      ]
    },
    {
      title: 'Gestión',
      roles: ['Administrador'],
      items: [
        { path: '/usuarios', label: 'Usuarios', icon: Users, roles: ['Administrador'] },
        { path: '/clientes', label: 'Clientes', icon: UserCheck, roles: ['Administrador'] },
        { path: '/productos', label: 'Productos', icon: Package, roles: ['Administrador'] },
        { path: '/categorias', label: 'Categorías', icon: Tags, roles: ['Administrador'] },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { path: '/ventas', label: 'Ventas', icon: ShoppingCart, roles: ['Administrador', 'Empleado'] },
        { path: '/compras', label: 'Abastecimiento', icon: Truck, roles: ['Administrador', 'Empleado'] },
        { path: '/inventario', label: 'Inventario', icon: Warehouse, roles: ['Administrador', 'Empleado'] },
        { path: '/devoluciones', label: 'Devoluciones', icon: Undo2, roles: ['Administrador', 'Empleado'] },
        { path: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['Administrador', 'Empleado'] },
        { path: '/caja', label: 'Caja', icon: Coins, roles: ['Administrador'] },
      ]
    },
    {
      title: 'Análisis',
      roles: ['Administrador'],
      items: [
        { path: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['Administrador'] },
      ]
    }
  ];

  return (
    <>
      {/* Overlay (móvil) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden opacity-100 transition-opacity duration-300" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside 
        className={`w-64 h-[100dvh] fixed top-0 left-0 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-serif text-white font-bold">
            IF
          </div>
          <span className="font-serif text-xl font-bold tracking-wide">
            Its <span className="text-blue-500">Fashion</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((section, idx) => {
            // Validar si la sección completa es para roles específicos
            if (section.roles && !section.roles.includes(user.rol)) return null;

            // Filtrar items según rol del usuario conectado
            const allowedItems = section.items.filter(item => item.roles.includes(user.rol));
            if (allowedItems.length === 0) return null;

            return (
              <div key={idx} className="pb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {allowedItems.map((item, itemIdx) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={itemIdx}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) toggleSidebar();
                        }}
                        className={({ isActive }) => 
                          `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive 
                              ? 'bg-blue-500/15 text-blue-400 border-r-3 border-blue-500 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 text-center" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
              {iniciales}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-xs text-slate-400">
                {user.rol}
              </p>
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
      </aside>
    </>
  );
};

export default Sidebar;
