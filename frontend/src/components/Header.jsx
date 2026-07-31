import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Calendar, Bell } from 'lucide-react';
import API from '../services/api';

const Header = ({ toggleSidebar, title }) => {
  const [pendingReturns, setPendingReturns] = useState(0);
  const navigate = useNavigate();

  // Cargar notificaciones de devoluciones pendientes
  useEffect(() => {
    const fetchPendingReturns = async () => {
      try {
        const res = await API.get('/returns');
        const pending = res.data.filter(r => r.estado === 'Pendiente').length;
        setPendingReturns(pending);
      } catch (error) {
        console.error('Error al obtener devoluciones pendientes:', error);
      }
    };

    fetchPendingReturns();
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchPendingReturns, 60000);
    return () => clearInterval(interval);
  }, []);

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('es-ES', options);
  };

  return (
    <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        {/* Hamburger button (móvil) */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors focus:outline-none" 
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-800 capitalize">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm text-slate-500 hidden md:flex items-center gap-2 font-light">
          <Calendar className="w-4 h-4 text-blue-500" />
          {getFormattedDate()}
        </span>

        {/* Campanilla de Notificaciones (Devoluciones Pendientes) */}
        <button 
          onClick={() => navigate('/devoluciones')} 
          title="Solicitudes de devolución pendientes"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors shadow-sm border border-slate-100 relative group focus:outline-none"
        >
          <Bell className="w-5 h-5 group-hover:scale-115 transition-transform" />
          {pendingReturns > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white animate-pulse">
              {pendingReturns}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
