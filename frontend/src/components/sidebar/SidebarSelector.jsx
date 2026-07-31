import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import EmpleadoSidebar from './EmpleadoSidebar';
import ClienteSidebar from './ClienteSidebar';

const SidebarSelector = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const iniciales = user.nombre && user.apellido 
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'US';
  const usuario = `${user.nombre} ${user.apellido}`;

  const renderSidebarContent = () => {
    switch (user.rol) {
      case 'Administrador':
        return <AdminSidebar logout={logout} iniciales={iniciales} usuario={usuario} />;
      case 'Empleado':
        return <EmpleadoSidebar logout={logout} iniciales={iniciales} usuario={usuario} />;
      case 'Cliente':
        return <ClienteSidebar logout={logout} iniciales={iniciales} usuario={usuario} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay (móvil) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden opacity-100 transition-opacity duration-300" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`w-64 h-[100dvh] fixed top-0 left-0 bg-slate-950 text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default SidebarSelector;
