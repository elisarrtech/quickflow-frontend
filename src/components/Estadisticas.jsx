import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

const Estadisticas = () => {
  const [tareas, setTareas] = useState([]);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchTareas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tareas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setTareas(data.reverse());
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      }
    };

    const fetchEventos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEventos(data);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      }
    };

    fetchTareas();
    fetchEventos();
  }, []);

  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;

  const totalEventos = eventos.length;
  const eventosHoy = eventos.filter(e => {
    const hoy = new Date().toISOString().split('T')[0];
    return e.fecha === hoy;
  }).length;

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
    return diffTime > 0 && diffTime <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Estadísticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card icon={<FaTasks />} label="Total Tareas" value={totalTareas} color="blue" />
        <Card icon={<FaCheckCircle />} label="Tareas Completadas" value={tareasCompletadas} color="green" />
        <Card icon={<FaClock />} label="Tareas Pendientes" value={tareasPendientes} color="yellow" />
        <Card icon={<FaCalendarAlt />} label="Eventos Hoy" value={eventosHoy} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <StatBlock title="Tareas por Categoría" data={tareasPorCategoria} color="gray" total={totalTareas} />
        <StatBlock title="Eventos por Tipo" data={eventosPorTipo} color="purple" total={totalEventos} />
      </div>

      <div className="mt-8 bg-gray-700 rounded-lg p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Resumen de Productividad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryBlock label="Tasa de Finalización" value={`${totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0}%`} sub="de tareas completadas" />
          <SummaryBlock label="Eventos Programados" value={totalEventos} sub="en el calendario" />
          <SummaryBlock label="Próximos 7 Días" value={proximosEventos} sub="eventos próximos" />
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon, label, value, color }) => (
  <div className={`bg-${color}-500/20 rounded-lg p-5 flex items-center`}>
    <div className={`bg-${color}-500/20 p-3 rounded-full mr-4`}>
      {React.cloneElement(icon, { className: `text-${color}-400 text-2xl` })}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const StatBlock = ({ title, data, color, total }) => (
  <div className="bg-gray-700 rounded-lg p-5">
    <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-gray-300">{key}</span>
          <div className="flex items-center">
            <div
              className={`h-2 rounded-full bg-${color}-500 mr-2`}
              style={{ width: `${(value / total) * 100}%`, maxWidth: 100 }}
            ></div>
            <span className="text-white w-8 text-right">{value}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SummaryBlock = ({ label, value, sub }) => (
  <div className="bg-gray-600 rounded-lg p-4 text-center">
    <p className="text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{sub}</p>
  </div>
);

export default Estadisticas;
