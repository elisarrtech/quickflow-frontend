import React, { useEffect, useState } from 'react';
import { FaTasks, FaChartBar, FaExclamationTriangle, FaHourglassHalf, FaCalendarWeek, FaUserClock } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Estadisticas = () => {
  const [stats, setStats] = useState({ completadas: 0, pendientes: 0 });
  const [categoriaStats, setCategoriaStats] = useState({});
  const [tareasAtrasadas, setTareasAtrasadas] = useState(0);
  const [porcentajeCumplimiento, setPorcentajeCumplimiento] = useState(0);
  const [productividadSemanal, setProductividadSemanal] = useState(0);
  const [tareasPorDia, setTareasPorDia] = useState({});
  const [tareasTotales, setTareasTotales] = useState([]);
  const [productividadMensual, setProductividadMensual] = useState({});

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroAsignado, setFiltroAsignado] = useState('');
  const API = import.meta.env.VITE_API_URL;

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  useEffect(() => {
    const token = localStorage.getItem('token');

    const obtenerEstadisticas = async () => {
      try {
        const res = await fetch(`${API}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener tareas");

        const tareas = await res.json();
        setTareasTotales(tareas);

        const anios = [...new Set(tareas.map(t => new Date(t.fecha).getFullYear()))];
        if (!filtroAnio) setFiltroAnio(anios[0]);
        if (!filtroAsignado) setFiltroAsignado('');

        aplicarFiltros(tareas);
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
      }
    };

    obtenerEstadisticas();
  }, []);

  useEffect(() => {
    if (tareasTotales.length > 0) {
      aplicarFiltros(tareasTotales);
    }
  }, [filtroMes, filtroAnio, filtroAsignado]);

  const aplicarFiltros = (tareas) => {
    const hoy = new Date();
    const tareasFiltradas = tareas.filter(t => {
      const fechaT = new Date(t.fecha);
      const cumpleMes = !filtroMes || fechaT.getMonth() === parseInt(filtroMes);
      const cumpleAnio = !filtroAnio || fechaT.getFullYear() === parseInt(filtroAnio);
      const cumpleAsignado = !filtroAsignado || t.asignadoA === filtroAsignado;
      return cumpleMes && cumpleAnio && cumpleAsignado;
    });

    const completadas = tareasFiltradas.filter(t => t.estado === 'completada').length;
    const pendientes = tareasFiltradas.filter(t => t.estado === 'pendiente').length;
    const atrasadas = tareasFiltradas.filter(t => {
      const fechaT = new Date(t.fecha);
      return fechaT < hoy && t.estado !== 'completada';
    }).length;

    setStats({ completadas, pendientes });
    setTareasAtrasadas(atrasadas);

    const total = completadas + pendientes;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    setPorcentajeCumplimiento(porcentaje);

    const categorias = {};
    const dias = {};
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() - 7);

    let tareasUltimaSemana = 0;

    tareasFiltradas.forEach(t => {
      const fechaT = new Date(t.fecha);
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

    const productividad = {};
    tareas
      .filter(t => t.estado === 'completada' && new Date(t.fecha).getFullYear() === parseInt(filtroAnio))
      .forEach(t => {
        const mes = new Date(t.fecha).getMonth();
        productividad[meses[mes]] = (productividad[meses[mes]] || 0) + 1;
      });
    setProductividadMensual(productividad);
  };

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
    <div id="estadisticas" className="text-white p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Estadísticas Generales</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => exportToPDF("estadisticas", "reporte-estadisticas", "Elisa")} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded">Exportar PDF</button>
        <button onClick={() => exportToExcel(tareasTotales, `estadisticas-${filtroAnio || 'all'}`)} className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded">Exportar Excel</button>
          <button
    onClick={async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/enviar-reporte`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) alert("📬 Reporte enviado a tu correo");
      else alert("❌ Error al enviar el reporte");
    }}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
  >
    Enviar Reporte PDF por Correo
  </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="input bg-gray-800 text-white">
          <option value="">Todos los meses</option>
          {meses.map((mes, i) => <option key={i} value={i}>{mes}</option>)}
        </select>
        <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} className="input bg-gray-800 text-white">
          {[...new Set(tareasTotales.map(t => new Date(t.fecha).getFullYear()))].map(anio => (
            <option key={anio} value={anio}>{anio}</option>
          ))}
        </select>
        <select value={filtroAsignado} onChange={e => setFiltroAsignado(e.target.value)} className="input bg-gray-800 text-white">
          <option value="">Todos los usuarios</option>
          {[...new Set(tareasTotales.map(t => t.asignadoA).filter(Boolean))].map(as => (
            <option key={as} value={as}>{as}</option>
          ))}
        </select>
      </div>

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

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow border border-cyan-600">
        <h2 className="text-xl font-semibold mb-4">Comparativa de Productividad Mensual ({filtroAnio})</h2>
        <Bar
          data={{
            labels: Object.keys(productividadMensual),
            datasets: [
              {
                label: 'Tareas completadas',
                data: Object.values(productividadMensual),
                backgroundColor: '#06b6d4'
              }
            ]
          }}
        />
      </div>
    </div>
  );
};

export default Estadisticas;
