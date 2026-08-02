import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../../services/api';
import { Lock, Mail, Key, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        email,
        password,
        token
      });
      if (res.data.ok) {
        setSuccessMsg(res.data.msg);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Error al restablecer contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4 sm:p-8 antialiased font-sans">
      <div className="w-11/12 max-w-[90vw] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Panel - Branding */}
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
              Restablece tu<br />contraseña
            </h2>
            <p className="text-gray-300 font-light text-base leading-relaxed mb-8">
              Ingresa el token que recibiste y define una nueva clave de acceso para tu cuenta.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight mb-2">Restablecer Contraseña</h1>
              <p className="text-slate-500 text-base font-light">Crea una nueva contraseña segura para tu acceso</p>
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
                  <p className="text-xs font-bold text-emerald-800">¡Contraseña restablecida!</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-gray-400 font-light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="token" className="block text-sm font-medium text-slate-900 mb-2">
                  Token de Recuperación
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Key className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Ej: 123456"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-gray-400 font-light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-gray-400 font-light"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-slate-900 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-gray-400 font-light"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none flex justify-center items-center"
              >
                <span>{loading ? 'Restableciendo...' : 'Restablecer Contraseña'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
