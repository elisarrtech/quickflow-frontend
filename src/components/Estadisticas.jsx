// src/components/Estadisticas.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pie, Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaCalendarAlt } from 'react-icons/fa';

const Estadisticas = () => {
  const [tareas, setTareas] = useState([]);
  const [completadas, setCompletadas] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [porCategoria, setPorCategoria] = useState({});
  const [eventosHoy, setEventosHoy] = useState(0);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${API}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setTareas(data);

          setCompletadas(data.filter(t => t.estado === 'completada').length);
          setPendientes(data.filter(t => t.estado === 'pendiente').length);

          const categorias = {};
          data.forEach(t => {
            const cat = t.categoria || 'Sin categoría';
            categorias[cat] = (categorias[cat] || 0) + 1;
          });
          setPorCategoria(categorias);
        }

        const eventosGuardados = localStorage.getItem('eventos');
        if (eventosGuardados) {
          const eventos = JSON.parse(eventosGuardados);
          const hoy = new Date().toISOString().split('T')[0];
          const count = eventos.filter(e => e.fecha === hoy).length;
          setEventosHoy(count);
        }
      } catch (err) {
        console.error('Error al cargar estadísticas', err);
      }
    };

    fetchData();
  }, []);

  const totalTareas = completadas + pendientes;
  const avance = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

  const tareasPorMes = tareas.reduce((acc, tarea) => {
    const mes = new Date(tarea.fecha).toLocaleString('default', { month: 'short' });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="text-white p-6 max-w-7xl mx-auto">
      <motion.h1 className="text-3xl font-bold mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Estadísticas Generales
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111827] rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Estado de Tareas</h2>
          <Pie
            data={{
              labels: ['Pendientes', 'Completadas'],
              datasets: [
                {
                  data: [pendientes, completadas],
                  backgroundColor: ['#facc15', '#4ade80'],
                },
              ],
            }}
          />
        </div>

        <div className="bg-[#111827] rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Tareas por Categoría</h2>
          <Bar
            data={{
              labels: Object.keys(porCategoria),
              datasets: [
                {
                  label: 'Tareas por categoría',
                  data: Object.values(porCategoria),
                  backgroundColor: '#38bdf8',
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111827] rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Evolución Mensual</h2>
          <Line
            data={{
              labels: Object.keys(tareasPorMes),
              datasets: [
                {
                  label: 'Tareas creadas',
                  data: Object.values(tareasPorMes),
                  borderColor: '#34d399',
                  backgroundColor: 'rgba(52, 211, 153, 0.2)',
                  tension: 0.3,
                },
              ],
            }}
          />
        </div>

        <div className="bg-[#111827] rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Progreso General</h2>
          <p className="text-gray-300 mb-2">{avance}% completado</p>
          <div className="w-full h-4 bg-gray-700 rounded">
            <div
              className="h-4 bg-green-500 rounded"
              style={{ width: `${avance}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] rounded-lg p-6 text-center shadow">
        <h2 className="text-xl font-semibold mb-2">Eventos para Hoy</h2>
        {eventosHoy > 0 ? (
          <p className="text-purple-400 font-bold text-lg">
            <FaCalendarAlt className="inline-block mr-2" />
            {eventosHoy} evento(s) programado(s) para hoy
          </p>
        ) : (
          <p className="text-gray-400">No hay eventos programados para hoy.</p>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
