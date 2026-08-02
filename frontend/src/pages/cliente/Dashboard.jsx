import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ClienteDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 font-serif">
        ¡Hola, {user?.nombre}!
      </h2>
      <p className="text-slate-500 font-light leading-relaxed mb-6">
        Bienvenido a tu portal de **Its Fashion**. Aquí podrás consultar tus compras realizadas, dar seguimiento a tus devoluciones solicitadas y gestionar tu perfil de usuario de forma rápida y segura.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/mis-compras" className="p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-blue-50/50 transition-colors block">
          <h3 className="font-semibold text-slate-700 mb-1">Mis Compras</h3>
          <p className="text-sm text-slate-500 font-light">Consulta tu historial detallado de pedidos.</p>
        </a>
        <a href="/mis-devoluciones" className="p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-blue-50/50 transition-colors block">
          <h3 className="font-semibold text-slate-700 mb-1">Devoluciones</h3>
          <p className="text-sm text-slate-500 font-light">Solicita y mira el estado de tus devoluciones.</p>
        </a>
      </div>
    </div>
  );
};

export default ClienteDashboard;
