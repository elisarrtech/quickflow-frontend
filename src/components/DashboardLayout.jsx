// src/components/DashboardLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaCalendarAlt, FaChartBar, FaUser, FaCog } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/tareas', icon: <FaTasks />, label: 'Tareas' },
    { path: '/eventos', icon: <FaCalendarAlt />, label: 'Eventos' },
    { path: '/estadisticas', icon: <FaChartBar />, label: 'Estadísticas' },
    { path: '/perfil', icon: <FaUser />, label: 'Perfil' },
    { path: '/configuracion', icon: <FaCog />, label: 'Configuración' }
  ];

  return (
    <div className="flex min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 hidden md:block border-r border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-white">Quickflow</h2>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:px-10">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
