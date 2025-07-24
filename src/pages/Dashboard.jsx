// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';
import { FaTasks, FaUserCircle, FaPlusCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const [stats, setStats] = useState({ completadas: 0, pendientes: 0 });

  useEffect(() => {
    const obtenerStats = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const completadas = data.filter(t => t.estado === 'completada').length;
        const pendientes = data.filter(t => t.estado === 'pendiente').length;
        setStats({ completadas, pendientes });
      }
    };
    obtenerStats();
  }, []);

  const data = {
    labels: ['Pendientes', 'Completadas'],
    datasets: [
      {
        data: [stats.pendientes, stats.completadas],
        backgroundColor: ['#facc15', '#4ade80'],
        borderWidth: 1
      }
    ]
  };

  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-6xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Panel Principal
        </motion.h1>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
        </motion.div>

        <motion.div
          className="bg-gray-900 rounded-lg p-6 shadow border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Estado general de tareas</h2>
          <div className="max-w-xs mx-auto">
            <Pie data={data} />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
