import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  X
} from 'lucide-react';

const Perfil = () => {
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  // Modal contraseña
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await API.put(`/auth/users/${user.id || user._id}`, {
        ...user,
        ...formData
      });
      if (res.data.ok) {
        showToast('Perfil actualizado correctamente');
        // Actualizar AuthContext si es necesario
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al actualizar perfil');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      const res = await API.put(`/auth/users/${user.id || user._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.ok) {
        showToast('Contraseña cambiada correctamente');
        setPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al cambiar contraseña');
    }
  };

  const iniciales = user?.nombre && user?.apellido 
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'US';

  return (
    <div className="p-2 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">Mi Perfil</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5 font-sans">Administra tus datos personales y credenciales de acceso</p>
          </div>
        </div>
        <button 
          onClick={() => { setErrorMsg(''); setPasswordModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200/50 transition duration-150"
        >
          <Lock className="w-4 h-4" /> Cambiar Contraseña
        </button>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-emerald-500 animate-slide-in">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}
      {errorMsg && !passwordModal && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-white max-w-xs border-l-4 border-red-500 animate-slide-in">
          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-slate-700 text-sm font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Tarjeta Avatar */}
        <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
          
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 mt-2">
            {iniciales}
          </div>
          
          <h3 className="text-base font-bold text-slate-800">{user?.nombre} {user?.apellido}</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mt-2 border border-blue-100">
            Cliente Preferencial
          </span>

          <hr className="my-5 border-slate-100" />

          <div className="text-left space-y-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Correo</p>
                <p className="font-semibold text-slate-700 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Teléfono</p>
                <p className="font-semibold text-slate-700">{user?.telefono || 'No registrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6">Mis Datos Personales</h3>
          
          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Apellido</label>
                <input 
                  type="text" 
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teléfono de Contacto</label>
              <input 
                type="text" 
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: +57 311 9876543"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
              <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition duration-300">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* MODAL CONTRASEÑA */}
      {passwordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-serif font-bold text-slate-800">
                Cambiar Contraseña
              </h3>
              <button onClick={() => setPasswordModal(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmitPassword} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-light">{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña Actual *</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nueva Contraseña *</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmar Nueva Contraseña *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setPasswordModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition duration-300">
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Perfil;
