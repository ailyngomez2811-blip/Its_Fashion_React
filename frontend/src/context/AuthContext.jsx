import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario autenticado al iniciar la app si hay token
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          if (res.data.ok) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error al validar sesión:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  // Función de Login
  const login = async (username, password) => {
    try {
      const res = await API.post('/auth/login', { username, password });
      if (res.data.ok) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, msg: res.data.msg || 'Error en el login' };
    } catch (error) {
      return {
        success: false,
        msg: error.response?.data?.msg || 'Error de conexión con el servidor'
      };
    }
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
