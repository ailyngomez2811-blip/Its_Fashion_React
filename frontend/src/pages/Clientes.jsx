import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Power, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const Clientes = () => {
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    telefono: '',
    rol: 'Cliente',
    estado: 'Activo'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadClients = async () => {
    try {
      const res = await API.get('/auth/users');
      // Filtrar para mostrar solo Clientes
      setClientsList(res.data.filter(u => u.rol === 'Cliente'));
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
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

  const handleOpenCreate = () => {
    setEditingClient(null);
    const randUser = 'cli_' + Math.floor(Math.random() * 100000);
    setFormData({
      nombre: '',
      apellido: '',
      username: randUser, // Se asigna un username único aleatorio ya que no es obligatorio para el cliente loguearse.
      email: '',
      telefono: '',
      rol: 'Cliente',
      estado: 'Activo'
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingClient(c);
    setFormData({
      nombre: c.nombre,
      apellido: c.apellido,
      username: c.username,
      email: c.email || '',
      telefono: c.telefono || '',
      rol: 'Cliente',
      estado: c.estado
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setErrorMsg('El nombre y el apellido son obligatorios');
      return;
    }

    try {
      if (editingClient) {
        const res = await API.put(`/auth/users/${editingClient._id}`, formData);
        if (res.data.ok) {
          showToast('Cliente actualizado correctamente');
          setModalOpen(false);
          loadClients();
        }
      } else {
        // Crear cliente - asignando un password por defecto ya que el backend requiere password
        const res = await API.post('/auth/register', { 
          ...formData, 
          password: 'cliente' + Math.floor(Math.random() * 1000) 
        });
        if (res.data.ok) {
          showToast('Cliente registrado correctamente');
          setModalOpen(false);
          loadClients();
        }
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al guardar el cliente');
    }
  };

  const handleToggleStatus = async (c) => {
    const newStatus = c.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const res = await API.put(`/auth/users/${c._id}`, { ...c, estado: newStatus });
      if (res.data.ok) {
        showToast(`Cliente ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
        loadClients();
      }
    } catch (error) {
      showToast('Error al cambiar el estado del cliente', false);
    }
  };

  const filteredClients = clientsList.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.telefono || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Directorio de Clientes</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Administración de compradores frecuentes de la boutique</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !modalOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Directorio General</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Historial de clientes de ventas</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-64"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-light">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-light">No hay clientes registrados</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.nombre} {c.apellido}</td>
                    <td className="px-6 py-4 text-slate-600">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{c.telefono || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        c.estado === 'Activo' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          title="Editar perfil"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(c)}
                          title={c.estado === 'Activo' ? 'Desactivar cliente' : 'Activar cliente'}
                          className={`p-1.5 hover:bg-slate-100 rounded-lg transition ${
                            c.estado === 'Activo' ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-green-600'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                {editingClient ? 'Editar Perfil Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Laura"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Apellido *</label>
                  <input 
                    type="text" 
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Ej: Gómez"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 300 1234567"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej: laura@gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
                <select 
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Clientes;
