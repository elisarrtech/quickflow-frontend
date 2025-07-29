import React, { useEffect, useState } from 'react';
import { FaTasks, FaChartBar, FaExclamationTriangle, FaHourglassHalf, FaCalendarWeek, FaUserClock } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Estadisticas = () => {
  const [stats, setStats] = useState({ completadas: 0, pendientes: 0 });
  const [categoriaStats, setCategoriaStats] = useState({});
  const [tareasAtrasadas, setTareasAtrasadas] = useState(0);
  const [porcentajeCumplimiento, setPorcentajeCumplimiento] = useState(0);
  const [productividadSemanal, setProductividadSemanal] = useState(0);
  const [tareasPorDia, setTareasPorDia] = useState({});
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    const obtenerEstadisticas = async () => {
      try {
        const res = await fetch(`${API}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const tareas = await res.json();
          console.log("🟢 Tareas recibidas:", tareas);

          tareas.forEach(t => {
          console.log("📅 Fecha:", t.fecha, "→ Estado:", t.estado);
});


          const hoy = new Date();
          const tareasDelMes = tareas.filter(t => {
            const fechaT = t.fecha ? new Date(t.fecha) : null;
            if (!fechaT || isNaN(fechaT)) return false;
            return fechaT.getMonth() === hoy.getMonth() && fechaT.getFullYear() === hoy.getFullYear();
          });

          const completadas = tareasDelMes.filter(t => t.estado === 'completada').length;
          const pendientes = tareasDelMes.filter(t => t.estado === 'pendiente').length;
          const atrasadas = tareas.filter(t => {
            const fechaT = t.fecha ? new Date(t.fecha) : null;
            return fechaT && !isNaN(fechaT) && fechaT < hoy && t.estado !== 'completada';
          }).length;

          setStats({ completadas, pendientes });
          setTareasAtrasadas(atrasadas);

          const totalMes = completadas + pendientes;
          const porcentaje = totalMes > 0 ? Math.round((completadas / totalMes) * 100) : 0;
          setPorcentajeCumplimiento(porcentaje);

          const categorias = {};
          const dias = {};
          const fechaLimite = new Date();
          fechaLimite.setDate(hoy.getDate() - 7);

          let tareasUltimaSemana = 0;

          tareas.forEach(t => {
            const fechaT = t.fecha ? new Date(t.fecha) : null;
            if (!fechaT || isNaN(fechaT)) return;

            const cat = t.categoria || 'Sin categoría';
            categorias[cat] = (categorias[cat] || 0) + 1;

            const dia = fechaT.toLocaleDateString('es-MX', { weekday: 'short' });
            dias[dia] = (dias[dia] || 0) + 1;

            if (fechaT >= fechaLimite && fechaT <= hoy && t.estado === 'completada') {
              tareasUltimaSemana++;
            }
          });

          setCategoriaStats(categorias);
          setProductividadSemanal(tareasUltimaSemana);
          setTareasPorDia(dias);
        }
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
      }
    };

    obtenerEstadisticas();
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

  const dataLine = {
    labels: Object.keys(tareasPorDia),
    datasets: [
      {
        label: 'Tareas por día',
        data: Object.values(tareasPorDia),
        borderColor: '#f472b6',
        backgroundColor: '#f472b6',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="text-white p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Estadísticas Generales</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Estado de Tareas</h2>
          <Pie data={dataPie} />
        </div>

        <div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Tareas por Categoría</h2>
          <Bar data={dataBar} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 p-6 rounded-lg shadow border border-yellow-600">
          <div className="flex items-center gap-4">
            <FaHourglassHalf className="text-3xl text-yellow-400" />
            <div>
              <h3 className="text-xl font-semibold">Cumplimiento mensual</h3>
              <p className="text-4xl mt-2">{porcentajeCumplimiento}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg shadow border border-red-600">
          <div className="flex items-center gap-4">
            <FaExclamationTriangle className="text-3xl text-red-400" />
            <div>
              <h3 className="text-xl font-semibold">Tareas Atrasadas</h3>
              <p className="text-4xl mt-2">{tareasAtrasadas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg shadow border border-green-600">
          <div className="flex items-center gap-4">
            <FaCalendarWeek className="text-3xl text-green-400" />
            <div>
              <h3 className="text-xl font-semibold">Productividad semanal</h3>
              <p className="text-4xl mt-2">{productividadSemanal}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg shadow border border-blue-600">
          <div className="flex items-center gap-4">
            <FaUserClock className="text-3xl text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold">Tareas por día</h3>
              <Bar data={dataLine} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
