// src/pages/Dashboard.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';
import { FaTasks, FaUserCircle, FaPlusCircle } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel Principal</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/tareas" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-blue-500">
            <div className="flex items-center gap-4">
              <FaTasks className="text-3xl text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold">Tareas</h2>
                <p className="text-gray-400 text-sm">Gestiona tus tareas, notas y archivos</p>
              </div>
            </div>
          </Link>

          <Link to="/perfil" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-purple-500">
            <div className="flex items-center gap-4">
              <FaUserCircle className="text-3xl text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold">Perfil</h2>
                <p className="text-gray-400 text-sm">Configura tus datos personales</p>
              </div>
            </div>
          </Link>

          <Link to="/nueva" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-green-500">
            <div className="flex items-center gap-4">
              <FaPlusCircle className="text-3xl text-green-400" />
              <div>
                <h2 className="text-xl font-semibold">Nueva Tarea</h2>
                <p className="text-gray-400 text-sm">Crea una nueva tarea rápidamente</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
