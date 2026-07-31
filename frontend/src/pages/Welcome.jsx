import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Tags, 
  Coins, 
  BarChart, 
  Check, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Welcome = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
      title: "El arte de gestionar tu moda",
      subtitle: "Control absoluto de tu inventario, tallas, colores y caja. Diseñado para tiendas de ropa que buscan elegancia y precisión en sus operaciones."
    },
    {
      image: "https://images.unsplash.com/photo-1558769132-cb1fac084092?q=80&w=2069&auto=format&fit=crop",
      title: "Precisión y estilo operativo",
      subtitle: "Optimiza las compras a proveedores, controla devoluciones y audita el Kárdex de stock de forma automatizada y sin complicaciones."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 60000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-serif text-white font-bold">IF</div>
              <span className="font-serif text-2xl font-bold tracking-wide text-slate-800">
                Its <span className="text-blue-600">Fashion</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Inicio</a>
              <a href="#soluciones" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Soluciones</a>
              <a href="#nosotros" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Nosotros</a>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-slate-900 hover:bg-blue-600 transition-all duration-300 shadow-md"
              >
                Acceder <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-slate-800 hover:text-blue-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 py-6 space-y-4 flex flex-col">
              <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium hover:text-blue-600">Inicio</a>
              <a href="#soluciones" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium hover:text-blue-600">Soluciones</a>
              <a href="#nosotros" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium hover:text-blue-600">Nosotros</a>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-center font-medium hover:bg-blue-600 transition-colors"
              >
                Acceder
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-slate-950 pt-20">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out transform ${
              index === activeSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            <img 
              src={slide.image} 
              className="w-full h-full object-cover" 
              alt="Fashion Slideshow" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/40"></div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Software para Boutiques
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
              El arte de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                gestionar tu moda
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light mb-10 max-w-xl leading-relaxed">
              {slides[activeSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#soluciones" 
                className="px-8 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Descubrir más
              </a>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                Ingresar al Sistema <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-3">
          <button 
            onClick={handlePrevSlide} 
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNextSlide} 
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Soluciones */}
      <section id="soluciones" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Control total, en cada detalle
            </h2>
            <p className="text-lg text-slate-500 font-light">
              Transformamos la complejidad del inventario de moda en una experiencia intuitiva. Olvídate de los desajustes de stock y enfócate en lo que importa: vender.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 p-10 rounded-2xl border border-slate-100 hover:translate-y-[-8px] hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-slate-100">
                <Tags className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Gestión por Variantes</h3>
              <p className="text-slate-500 font-light leading-relaxed text-sm">
                Control exhaustivo por prenda, color y talla. Conoce exactamente cuántas unidades tienes de cada variación en tiempo real.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 hover:translate-y-[-8px] hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Punto de Venta Ágil</h3>
              <p className="text-slate-400 font-light leading-relaxed text-sm">
                Sistema de caja integrado. Registra ventas, aplica descuentos y genera recibos de manera rápida para no hacer esperar a tus clientes.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-slate-50 p-10 rounded-2xl border border-slate-100 hover:translate-y-[-8px] hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-slate-100">
                <BarChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Reportes Inteligentes</h3>
              <p className="text-slate-500 font-light leading-relaxed text-sm">
                Toma decisiones basadas en datos. Visualiza qué prendas se venden más, controla tus márgenes de ganancia y optimiza tus compras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nosotros / Stats */}
      <section id="nosotros" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop" 
                  className="w-full h-full object-cover" 
                  alt="Fashion Boutique" 
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block border border-slate-100">
                <div className="text-4xl font-serif font-bold text-blue-600 mb-2">100%</div>
                <div className="text-sm font-medium text-slate-800">Precisión en el control de tu stock de moda.</div>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-slate-500 font-light mb-8 leading-relaxed">
                Empoderar a los dueños de boutiques y tiendas de ropa con una herramienta tecnológica que elimine el caos administrativo. Creemos que la gestión del inventario debe ser tan elegante y fluida como las prendas que vendes.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Diseño Intuitivo</h4>
                    <p className="text-slate-500 font-light text-sm">Una interfaz fácil de usar que no requiere semanas de capacitación.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Seguridad de Datos</h4>
                    <p className="text-slate-500 font-light text-sm">Tu información financiera y de stock, protegida y respaldada en todo momento.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-serif text-white font-bold">IF</div>
                <span className="font-serif text-xl font-bold tracking-wide">Its <span className="text-blue-500">Fashion</span></span>
              </div>
              <p className="text-slate-400 font-light text-sm leading-relaxed max-w-sm mb-6">
                La combinación perfecta entre elegancia y control operativo. Gestiona tu boutique con el estándar más alto del sector de la moda.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-6">Explorar</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-light">
                <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#soluciones" className="hover:text-white transition-colors">Soluciones</a></li>
                <li><a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-6">Contacto</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                ¿Tienes dudas?<br />
                Soporte: info@itsfashion.com<br />
                Tel: +57 (300) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-light">
            <p>&copy; {new Date().getFullYear()} Its Fashion. Todos los derechos reservados.</p>
            <p>Diseño de Gestión Premium para Boutiques.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
