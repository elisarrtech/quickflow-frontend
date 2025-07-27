// src/pages/Estadisticas.jsx
import React, { useState, useEffect } from 'react';
import { FaTasks, FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

const Estadisticas = () => {
  const [tareas, setTareas] = useState([]);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Cargar tareas del localStorage
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
      try {
        setTareas(JSON.parse(tareasGuardadas));
      } catch (e) {
        console.error("Error parsing tareas from localStorage", e);
        setTareas([]);
      }
    }

    // Cargar eventos del localStorage
    const eventosGuardados = localStorage.getItem('eventos');
    if (eventosGuardados) {
      try {
        setEventos(JSON.parse(eventosGuardados));
      } catch (e) {
        console.error("Error parsing eventos from localStorage", e);
        setEventos([]);
      }
    }
  }, []);

  // Calcular estadísticas de tareas
  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const tareasEnProgreso = tareas.filter(t => t.estado === 'en progreso').length;

  // Calcular estadísticas de eventos
  const totalEventos = eventos.length;
  const eventosHoy = eventos.filter(e => {
    const hoy = new Date().toISOString().split('T')[0];
    return e.fecha === hoy;
  }).length;

  // Calcular tareas por categoría
  const tareasPorCategoria = tareas.reduce((acc, tarea) => {
    acc[tarea.categoria] = (acc[tarea.categoria] || 0) + 1;
    return acc;
  }, {});

  // Calcular eventos por tipo
  const eventosPorTipo = eventos.reduce((acc, evento) => {
    acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="bg-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Estadísticas</h1>
        
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-700 rounded-lg p-5 flex items-center">
            <div className="bg-blue-500/20 p-3 rounded-full mr-4">
              <FaTasks className="text-blue-400 text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Tareas</p>
              <p className="text-2xl font-bold text-white">{totalTareas}</p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-5 flex items-center">
            <div className="bg-green-500/20 p-3 rounded-full mr-4">
              <FaCheckCircle className="text-green-400 text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tareas Completadas</p>
              <p className="text-2xl font-bold text-white">{tareasCompletadas}</p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-5 flex items-center">
            <div className="bg-yellow-500/20 p-3 rounded-full mr-4">
              <FaClock className="text-yellow-400 text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tareas Pendientes</p>
              <p className="text-2xl font-bold text-white">{tareasPendientes}</p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-5 flex items-center">
            <div className="bg-purple-500/20 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-purple-400 text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Eventos Hoy</p>
              <p className="text-2xl font-bold text-white">{eventosHoy}</p>
            </div>
          </div>
        </div>
        
        {/* Gráficos de tareas y eventos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tareas por categoría */}
          <div className="bg-gray-700 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-white mb-4">Tareas por Categoría</h2>
            <div className="space-y-3">
              {Object.entries(tareasPorCategoria).map(([categoria, cantidad]) => (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-gray-300">{categoria || 'Sin categoría'}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-600 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(cantidad / totalTareas) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white w-8 text-right">{cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Eventos por tipo */}
          <div className="bg-gray-700 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-white mb-4">Eventos por Tipo</h2>
            <div className="space-y-3">
              {Object.entries(eventosPorTipo).map(([tipo, cantidad]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{tipo}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-600 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(cantidad / totalEventos) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white w-8 text-right">{cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sección adicional de productividad */}
        <div className="mt-8 bg-gray-700 rounded-lg p-5">
          <h2 className="text-xl font-semibold text-white mb-4">Resumen de Productividad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-400">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-white mt-2">
                {totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0}%
              </p>
              <p className="text-gray-400 text-sm mt-1">de tareas completadas</p>
            </div>
            
            <div className="bg-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-400">Eventos Programados</p>
              <p className="text-2xl font-bold text-white mt-2">{totalEventos}</p>
              <p className="text-gray-400 text-sm mt-1">en el calendario</p>
            </div>
            
            <div className="bg-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-400">Próximos 7 Días</p>
              <p className="text-2xl font-bold text-white mt-2">
                {eventos.filter(e => {
                  const fechaEvento = new Date(e.fecha);
                  const hoy = new Date();
                  const diffTime = fechaEvento - hoy;
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  return diffDays >= 0 && diffDays <= 7;
                }).length}
              </p>
              <p className="text-gray-400 text-sm mt-1">eventos próximos</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Estadisticas;
