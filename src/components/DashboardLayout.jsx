// src/components/DashboardLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTasks, FaHome, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/tareas', icon: <FaTasks />, label: 'Tareas' },
    { path: '/perfil', icon: <FaUser />, label: 'Perfil' }
  ];

  return (
    <div className="flex min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-40 w-64 bg-gray-900 p-6 h-full border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:block`}
      >
        <h2 className="text-xl font-bold mb-6 text-white">Quickflow</h2>
        <nav className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-10 mt-12 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
