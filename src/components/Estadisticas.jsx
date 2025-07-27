import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

const Estadisticas = () => {
  const [tareas, setTareas] = useState([]);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchTareas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setTareas(data);
      } catch (error) {
        console.error("Error cargando tareas:", error);
      }
    };

    const fetchEventos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setEventos(data);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      }
    };

    fetchTareas();
    fetchEventos();
  }, []);

  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const totalEventos = eventos.length;
  const eventosHoy = eventos.filter(e => e.fecha === new Date().toISOString().split('T')[0]).length;

  const tareasPorCategoria = tareas.reduce((acc, tarea) => {
    const cat = tarea.categoria || 'Sin categoría';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const eventosPorTipo = eventos.reduce((acc, evento) => {
    acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
    return acc;
  }, {});

  const proximosEventos = eventos.filter(e => {
    const fechaEvento = new Date(`${e.fecha}T${e.hora}`);
    const hoy = new Date();
    const diff = fechaEvento - hoy;
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Estadísticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card icon={<FaTasks className="text-blue-400 text-2xl" />} title="Total Tareas" value={totalTareas} bg="blue" />
        <Card icon={<FaCheckCircle className="text-green-400 text-2xl" />} title="Tareas Completadas" value={tareasCompletadas} bg="green" />
        <Card icon={<FaClock className="text-yellow-400 text-2xl" />} title="Tareas Pendientes" value={tareasPendientes} bg="yellow" />
        <Card icon={<FaCalendarAlt className="text-purple-400 text-2xl" />} title="Eventos Hoy" value={eventosHoy} bg="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <StatBlock title="Tareas por Categoría" data={tareasPorCategoria} total={totalTareas} color="gray" />
        <StatBlock title="Eventos por Tipo" data={eventosPorTipo} total={totalEventos} color="purple" />
      </div>

      <div className="mt-8 bg-gray-700 rounded-lg p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Resumen de Productividad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Tasa de Finalización" value={`${totalTareas ? Math.round((tareasCompletadas / totalTareas) * 100) : 0}%`} subtitle="de tareas completadas" />
          <SummaryCard title="Eventos Programados" value={totalEventos} subtitle="en el calendario" />
          <SummaryCard title="Próximos 7 Días" value={proximosEventos} subtitle="eventos próximos" />
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon, title, value, bg }) => (
  <div className={`bg-${bg}-500/20 rounded-lg p-5 flex items-center`}>
    <div className={`bg-${bg}-500/20 p-3 rounded-full mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const StatBlock = ({ title, data, total, color }) => (
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

const SummaryCard = ({ title, value, subtitle }) => (
  <div className="bg-gray-600 rounded-lg p-4 text-center">
    <p className="text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
  </div>
);

export default Estadisticas;
