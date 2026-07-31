import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles específicos configurados y el del usuario no coincide, redirigir al home/dashboard
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
