import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Clock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      // Guardar preferencia de sesión si el usuario lo desea
      if (remember) {
        localStorage.setItem('rememberSession', 'true');
      } else {
        localStorage.removeItem('rememberSession');
      }
      navigate('/dashboard');
    } else {
      setError(result.msg);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4 sm:p-8 antialiased font-sans">
      <div className="w-11/12 max-w-[90vw] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Panel - Branding (Image + Overlay) */}
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
              El arte de<br />gestionar tu moda
            </h2>
            <p className="text-gray-300 font-light text-base leading-relaxed mb-8">
              Accede a tu panel para gestionar inventario, ventas, caja y mucho más. Todo el control de tu boutique en un solo lugar.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-light text-sm">Protección de datos con encriptación</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-light text-sm">Acceso seguro disponible 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
          <div className="md:hidden flex items-center gap-2 mb-8 text-slate-900">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-serif font-bold">IF</div>
            <span className="font-serif text-xl font-bold tracking-wide">
              Its <span className="text-blue-500">Fashion</span>
            </span>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 class="text-3xl font-serif font-bold text-slate-900 tracking-tight mb-2">Iniciar Sesión</h1>
              <p class="text-slate-500 text-base font-light">Ingresa tus credenciales para continuar</p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-fade-in" role="alert">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-900 mb-2">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario o correo@ejemplo.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-gray-400 font-light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                  Contraseña
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
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-slate-500 cursor-pointer hover:text-slate-900 transition">
                    Recordar sesión
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-500 font-medium hover:text-blue-700 transition">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex justify-center items-center gap-2"
              >
                <span>{loading ? 'Cargando...' : 'Entrar al Sistema'}</span>
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500">
                ¿No tienes una cuenta? <Link to="/register" className="text-blue-500 font-medium hover:underline">Regístrate</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
