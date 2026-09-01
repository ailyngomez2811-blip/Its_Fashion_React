import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        ...formData,
        rol: 'Cliente' // Por defecto se registra como cliente
      });
      if (res.data.ok || res.data._id) {
        setSuccessMsg('Registro completado correctamente. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4 sm:p-8 antialiased font-sans">
      <div className="w-11/12 max-w-[90vw] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left Panel */}
        <div className="md:w-5/12 relative hidden md:flex flex-col justify-between overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Boutique" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 to-slate-950/60"></div>

          <div className="relative z-10 p-12">
            <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <span className="font-serif text-xl font-bold text-white tracking-wider">IF</span>
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                Its <span className="text-blue-500">Fashion</span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 p-12 mt-auto">
            <h2 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
              Únete a nuestra<br />boutique preferida
            </h2>
            <p className="text-gray-300 font-light text-base leading-relaxed mb-8">
              Crea tu cuenta de cliente preferencial para mirar tus compras, solicitar devoluciones y recibir beneficios exclusivos.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative max-h-[90vh] overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight mb-2">Crear Cuenta</h1>
              <p className="text-slate-500 text-base font-light font-sans">Registra tus datos personales para acceder al portal</p>
            </div>

            {/* Mensaje de error */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Mensaje de éxito */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-emerald-800">¡Registro Exitoso!</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Ana"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Apellido *</label>
                  <input 
                    type="text" 
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Silva"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre de Usuario *</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: anasilva"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teléfono *</label>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 3123456789"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  required
                  placeholder="Ej: ana@correo.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmar Contraseña *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none flex justify-center items-center"
              >
                <span>{loading ? 'Registrando...' : 'Crear mi Cuenta'}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-500 font-medium hover:underline">Inicia Sesión</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
