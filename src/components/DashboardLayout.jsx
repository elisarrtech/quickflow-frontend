// src/components/DashboardLayout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTasks, FaSignOutAlt, FaPlus } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      <aside className="w-64 bg-gray-900 p-6 space-y-6 shadow-md">
        <h1 className="text-2xl font-bold">Quickflow</h1>
        <nav className="space-y-3">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400">
            <FaTasks /> Dashboard
          </Link>
          <Link to="/tareas" className="flex items-center gap-2 hover:text-blue-400">
            <FaPlus /> Nueva Tarea
          </Link>
        </nav>
        <button onClick={logout} className="mt-10 flex items-center gap-2 text-red-400 hover:text-red-600">
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 p-8 bg-gray-950 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
