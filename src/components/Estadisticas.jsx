import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const Estadisticas = () => {
  const [tareas, setTareas] = useState([]);
  const [eventos, setEventos] = useState([]);

useEffect(() => {
  const token = localStorage.getItem('token');

  const fetchTareas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tareas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTareas(data.reverse()); // o simplemente data si no necesitas orden descendente
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const fetchEventos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEventos(data);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };

  fetchTareas();
  fetchEventos();
}, []);


  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado !== 'completada').length;

  const totalEventos = eventos.length;
  const eventosHoy = eventos.filter(e => e.fecha === new Date().toISOString().split('T')[0]).length;

  const tareasPorCategoria = tareas.reduce((acc, tarea) => {
    const categoria = tarea.categoria || 'Sin categoría';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  const eventosPorTipo = eventos.reduce((acc, evento) => {
    const tipo = evento.tipo || 'Otro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const proximosEventos = eventos.filter(e => {
    const fechaEvento = new Date(`${e.fecha}T${e.hora}`);
    const hoy = new Date();
    const diffTime = fechaEvento - hoy;
    return diffTime > 0 && diffTime <= 604800000; // 7 días
  }).length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Estadísticas</h1>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Tareas" value={totalTareas} icon={<FaTasks />} color="blue" />
        <Card title="Tareas Completadas" value={tareasCompletadas} icon={<FaCheckCircle />} color="green" />
        <Card title="Tareas Pendientes" value={tareasPendientes} icon={<FaClock />} color="yellow" />
        <Card title="Eventos Hoy" value={eventosHoy} icon={<FaCalendarAlt />} color="purple" />
      </div>

      {/* Gráficos de tareas y eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ListStats title="Tareas por Categoría" data={tareasPorCategoria} total={totalTareas} color="gray" />
        <ListStats title="Eventos por Tipo" data={eventosPorTipo} total={totalEventos} color="purple" />
      </div>

      {/* Resumen de productividad */}
      <div className="mt-8 bg-gray-700 rounded-lg p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Resumen de Productividad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryBox label="Tasa de Finalización" value={`${totalTareas ? Math.round((tareasCompletadas / totalTareas) * 100) : 0}%`} sub="de tareas completadas" />
          <SummaryBox label="Eventos Programados" value={totalEventos} sub="en el calendario" />
          <SummaryBox label="Próximos 7 Días" value={proximosEventos} sub="eventos próximos" />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, color }) => (
  <div className={`bg-${color}-500/20 rounded-lg p-5 flex items-center`}>
    <div className={`bg-${color}-500/20 p-3 rounded-full mr-4`}>
      {React.cloneElement(icon, { className: `text-${color}-400 text-2xl` })}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ListStats = ({ title, data, total, color }) => (
  <div className="bg-gray-700 rounded-lg p-5">
    <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
    <div className="space-y-3">
      {Object.entries(data).map(([label, count]) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-gray-300">{label}</span>
          <div className="flex items-center">
            <div
              className={`w-32 bg-${color}-500 rounded-full h-2 mr-2`}
              style={{ width: `${(count / total) * 100}%` }}
            />
            <span className="text-white w-8 text-right">{count}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SummaryBox = ({ label, value, sub }) => (
  <div className="bg-gray-600 rounded-lg p-4 text-center">
    <p className="text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{sub}</p>
  </div>
);

export default Estadisticas;
