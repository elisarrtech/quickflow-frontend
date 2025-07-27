// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';
import { FaTasks, FaUserCircle, FaPlusCircle, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const [stats, setStats] = useState({ completadas: 0, pendientes: 0 });
  const [categoriaStats, setCategoriaStats] = useState({});
  const [eventosHoy, setEventosHoy] = useState(0);

  useEffect(() => {
    const obtenerStats = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // Obtener tareas
        const resTareas = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resTareas.ok) {
          const tareas = await resTareas.json();
          const completadas = tareas.filter(t => t.estado === 'completada').length;
          const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
          setStats({ completadas, pendientes });

          const categorias = {};
          tareas.forEach(t => {
            const cat = t.categoria || 'Sin categoría';
            if (!categorias[cat]) categorias[cat] = 0;
            categorias[cat] += 1;
          });
          setCategoriaStats(categorias);
        }

        // Obtener eventos
        const eventosGuardados = localStorage.getItem('eventos');
        if (eventosGuardados) {
          const eventos = JSON.parse(eventosGuardados);
          const hoy = new Date().toISOString().split('T')[0];
          const eventosHoyCount = eventos.filter(e => e.fecha === hoy).length;
          setEventosHoy(eventosHoyCount);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };
    
    obtenerStats();
  }, []);

  const dataPie = {
    labels: ['Pendientes', 'Completadas'],
    datasets: [
      {
        data: [stats.pendientes, stats.completadas],
        backgroundColor: ['#facc15', '#4ade80'],
        borderWidth: 1
      }
    ]
  };

  const dataBar = {
    labels: Object.keys(categoriaStats),
    datasets: [
      {
        label: 'Tareas por categoría',
        data: Object.values(categoriaStats),
        backgroundColor: '#60a5fa'
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
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

          <Link to="/eventos" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-purple-500">
            <div className="flex items-center gap-4">
              <FaCalendarAlt className="text-3xl text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold">Eventos</h2>
                <p className="text-gray-400 text-sm">Organiza reuniones y citas</p>
                {eventosHoy > 0 && (
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded-full">
                    {eventosHoy} hoy
                  </span>
                )}
              </div>
            </div>
          </Link>

          <Link to="/estadisticas" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-green-500">
            <div className="flex items-center gap-4">
              <FaChartBar className="text-3xl text-green-400" />
              <div>
                <h2 className="text-xl font-semibold">Estadísticas</h2>
                <p className="text-gray-400 text-sm">Analiza tu productividad</p>
              </div>
            </div>
          </Link>

          <Link to="/perfil" className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-700 hover:border-yellow-500">
            <div className="flex items-center gap-4">
              <FaUserCircle className="text-3xl text-yellow-400" />
              <div>
                <h2 className="text-xl font-semibold">Perfil</h2>
                <p className="text-gray-400 text-sm">Configura tus datos personales</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            className="bg-gray-900 rounded-lg p-6 shadow border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Estado general de tareas</h2>
            <div className="max-w-xs mx-auto">
              {stats.completadas + stats.pendientes > 0 ? (
                <Pie data={dataPie} />
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <FaTasks className="mx-auto text-4xl mb-3 opacity-50" />
                  <p>No hay tareas registradas</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900 rounded-lg p-6 shadow border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-4">Tareas por Categoría</h2>
            <div className="max-w-3xl mx-auto">
              {Object.keys(categoriaStats).length > 0 ? (
                <Bar data={dataBar} />
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <FaChartBar className="mx-auto text-4xl mb-3 opacity-50" />
                  <p>No hay categorías registradas</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="bg-gray-900 rounded-lg p-6 shadow border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Accesos Directos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/tareas" 
              className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              <FaPlusCircle className="text-blue-400 text-xl" />
              <span>Nueva Tarea</span>
            </Link>
            
            <Link 
              to="/eventos" 
              className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              <FaCalendarAlt className="text-purple-400 text-xl" />
              <span>Nuevo Evento</span>
            </Link>
            
            <Link 
              to="/estadisticas" 
              className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              <FaChartBar className="text-green-400 text-xl" />
              <span>Ver Estadísticas</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
