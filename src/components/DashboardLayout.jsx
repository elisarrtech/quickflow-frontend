// src/components/DashboardLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome, FaCheckCircle, FaEdit, FaTrashAlt, FaPlus, FaTag, FaExternalLinkAlt,
  FaPaperclip, FaCheckSquare, FaRegSquare, FaTimes, FaEllipsisV, FaUser,
  FaTasks, FaCalendarAlt
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 hidden md:block border-r border-gray-700">
        <h2 className="text-xl font-bold mb-6">Quickflow</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-3 text-gray-300 hover:text-white">
            <FaHome /> Dashboard
          </Link>
          <Link to="/tareas" className="flex items-center gap-3 text-gray-300 hover:text-white">
            <FaTasks /> Tareas
          </Link>
          <Link to="/eventos" className="flex items-center gap-3 text-gray-300 hover:text-white">
            <FaCalendarAlt /> Eventos
          </Link>
          <Link to="/perfil" className="flex items-center gap-3 text-gray-300 hover:text-white">
            <FaUser /> Perfil
          </Link>
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
