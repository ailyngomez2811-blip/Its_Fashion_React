import React, { useState } from 'react';
import SidebarSelector from './sidebar/SidebarSelector';
import Header from './Header';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Sidebar de rol dinámico */}
      <SidebarSelector isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Header Superior */}
        <Header toggleSidebar={toggleSidebar} title={title} />

        {/* Contenedor de Vistas */}
        <main className="flex-1 p-4 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
