import React, { useState, useEffect } from 'react';
import API from '../../services/api';
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

const Usuarios = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'Empleado',
    estado: 'Activo'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      // Filtrar para mostrar solo Administradores y Empleados (no Clientes)
      setUsersList(res.data.filter(u => u.rol !== 'Cliente'));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      username: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'Empleado',
      estado: 'Activo'
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      username: u.username,
      email: u.email,
      password: '', // Password vacío para no sobreescribir a menos que se ingrese
      telefono: u.telefono || '',
      rol: u.rol,
      estado: u.estado
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

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.username.trim() || !formData.email.trim()) {
      setErrorMsg('Todos los campos marcados con * son obligatorios');
      return;
    }

    if (!editingUser && !formData.password) {
      setErrorMsg('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    try {
      if (editingUser) {
        // Preparar payload excluyendo password si está vacío
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await API.put(`/auth/users/${editingUser._id}`, payload);
        if (res.data.ok) {
          showToast('Usuario actualizado correctamente');
          setModalOpen(false);
          loadUsers();
        }
      } else {
        // Crear
        const res = await API.post('/auth/register', formData);
        if (res.data.ok) {
          showToast('Usuario creado y registrado correctamente');
          setModalOpen(false);
          loadUsers();
        }
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al guardar el usuario');
    }
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const res = await API.put(`/auth/users/${u._id}`, { ...u, estado: newStatus });
      if (res.data.ok) {
        showToast(`Usuario ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
        loadUsers();
      }
    } catch (error) {
      showToast('Error al cambiar el estado del usuario', false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Personal del Sistema</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Administración de administradores y empleados con acceso al sistema</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300 shadow-md shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" /> Nuevo Personal
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

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        
        {/* Filtros */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-800 font-serif">Colaboradores</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Usuarios del panel interno</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por usuario, correo..." 
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando personal...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-light">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-light">No hay usuarios registrados</p>
                  </td>
                </tr>
              ) : (
                currentItems.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{u.nombre} {u.apellido}</td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-xs">@{u.username}</td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-slate-600">{u.telefono || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.rol === 'Administrador' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        u.estado === 'Activo' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          title="Editar perfil"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          title={u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`p-1.5 hover:bg-slate-100 rounded-lg transition ${
                            u.estado === 'Activo' ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-green-600'
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

        {/* Paginación */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} resultados</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                Anterior
              </button>
              <span className="px-3 text-slate-600">Página {currentPage} de {totalPages || 1}</span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                {editingUser ? 'Editar Perfil Colaborador' : 'Nuevo Colaborador'}
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
                    placeholder="Ej: Juan"
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
                    placeholder="Ej: Pérez"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre Usuario *</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Ej: juanperez"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: +57 300..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej: juan@itsfashion.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {editingUser ? 'Nueva Contraseña (Dejar vacío para conservar)' : 'Contraseña *'}
                </label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingUser ? '••••••••' : 'Contraseña de acceso'}
                  required={!editingUser}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rol *</label>
                  <select 
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Empleado">Empleado</option>
                    <option value="Administrador">Administrador</option>
                  </select>
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
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">
                  {editingUser ? 'Guardar Cambios' : 'Registrar Colaborador'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Usuarios;
