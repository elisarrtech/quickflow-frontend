import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { FaTasks, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import 'chart.js/auto';

const Estadisticas = () => {
  const [stats, setStats] = useState({ completadas: 0, pendientes: 0 });
  const [categoriaStats, setCategoriaStats] = useState({});
  const [eventosHoy, setEventosHoy] = useState(0);
  const API = import.meta.env.VITE_API_URL + '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchEstadisticas = async () => {
      try {
        // ✅ Obtener tareas
        const resTareas = await fetch(`${API}/tasks`, {
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
            categorias[cat] = (categorias[cat] || 0) + 1;
          });
          setCategoriaStats(categorias);
        }

        // ✅ Obtener eventos desde localStorage
        const eventosGuardados = localStorage.getItem('eventos');
        if (eventosGuardados) {
          const eventos = JSON.parse(eventosGuardados);
          const hoy = new Date().toISOString().split('T')[0];
          const eventosHoyCount = eventos.filter(e => e.fecha === hoy).length;
          setEventosHoy(eventosHoyCount);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    fetchEstadisticas();
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
        backgroundColor: '#38bdf8'
      }
    ]
  };

  return (
    <div className="text-white p-6 max-w-6xl mx-auto">
      <motion.h1 className="text-3xl font-bold mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Estadísticas Generales
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold mb-4">Estado de Tareas</h2>
          <div className="max-w-xs mx-auto">
            {stats.completadas + stats.pendientes > 0 ? (
              <Pie data={dataPie} />
            ) : (
              <div className="text-center text-gray-500 py-10">
                <FaTasks className="text-4xl mx-auto mb-3 opacity-50" />
                <p>No hay tareas registradas</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-semibold mb-4">Tareas por Categoría</h2>
          <div className="max-w-3xl mx-auto">
            {Object.keys(categoriaStats).length > 0 ? (
              <Bar data={dataBar} />
            ) : (
              <div className="text-center text-gray-500 py-10">
                <FaTasks className="text-4xl mx-auto mb-3 opacity-50" />
                <p>No hay categorías registradas</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-xl font-semibold mb-4">Eventos para Hoy</h2>
        {eventosHoy > 0 ? (
          <p className="text-2xl font-bold text-purple-400">
            <FaCalendarAlt className="inline-block mr-2" />
            {eventosHoy} evento(s) programado(s) para hoy
          </p>
        ) : (
          <p className="text-gray-400">No hay eventos programados para hoy</p>
        )}
      </motion.div>
    </div>
  );
};

export default Estadisticas;
