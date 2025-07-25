// src/pages/Tareas.jsx
import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaTag,
  FaExternalLinkAlt,
  FaPaperclip,
  FaCheckSquare,
  FaRegSquare,
  FaTimes,
  FaEllipsisV
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subtareasInput, setSubtareasInput] = useState('');
  const [subtareas, setSubtareas] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [enlace, setEnlace] = useState('');
  const [nota, setNota] = useState('');
  const [modoEdicion, setModoEdicion] = useState(null);
  const [error, setError] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(null);

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => { Notification.requestPermission(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      tareas.forEach(t => {
        if (t.estado === 'pendiente' && t.fecha === ahora.toISOString().split('T')[0] && t.hora && new Date(`${t.fecha}T${t.hora}`) <= ahora) {
          new Notification('⏰ Recordatorio programado', {
            body: `${t.titulo} está programada para esta hora`,
            icon: '/favicon.ico'
          });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tareas]);

  useEffect(() => {
    const obtenerTareas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setTareas(data);
        }
      } catch {}
    };
    obtenerTareas();
  }, []);

  const filtrarTareas = () => {
    let filtradas = [...tareas];
    if (categoriaFiltro) filtradas = filtradas.filter(t => t.categoria === categoriaFiltro);
    if (estadoFiltro) filtradas = filtradas.filter(t => t.estado === estadoFiltro);
    if (fechaInicio && !fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha).toISOString().split('T')[0] === fechaInicio);
    if (fechaInicio && fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha) >= new Date(fechaInicio) && new Date(t.fecha) <= new Date(fechaFin));
    return filtradas.sort((a, b) => a.estado !== b.estado ? (a.estado === 'pendiente' ? -1 : 1) : new Date(a.fecha) - new Date(b.fecha));
  };

  const tareasFiltradas = filtrarTareas();

  const limpiarFormulario = () => {
    setTitulo(''); setDescripcion(''); setFecha(''); setHora(''); setCategoria(''); setNota(''); setEnlace(''); setSubtareas([]); setArchivo(null); setError('');
  };

  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setEstadoFiltro('');
    setFechaInicio('');
    setFechaFin('');
  };

  const crearTarea = async () => {
    if (!titulo.trim()) return setError('El título es obligatorio');
    if (tareas.some(t => t.titulo.toLowerCase() === titulo.trim().toLowerCase())) return setError('Ya existe una tarea con ese título');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('categoria', categoria);
    formData.append('nota', nota);
    formData.append('enlace', enlace);
    formData.append('subtareas', JSON.stringify(subtareas));
    if (archivo) formData.append('archivo', archivo);

    const res = await fetch(`${API}/api/tasks`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (res.ok) {
      setTareas(prev => [...prev, data]);
      limpiarFormulario();
    }
  };

  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Filtrar por categoría" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="input bg-gray-800 text-white" />
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
          </select>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input bg-gray-800 text-white" />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input bg-gray-800 text-white" />
        </div>
        <button onClick={limpiarFiltros} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mb-4">Limpiar filtros</button>

        {/* Lista de tareas */}
        <div className="space-y-4 mt-6">
          {tareasFiltradas.map(t => (
            <div key={t._id} className={`p-4 rounded border ${t.estado === 'completada' ? 'border-green-600 bg-green-900/20' : 'border-yellow-500 bg-yellow-900/10'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {t.estado === 'completada' ? <FaCheckCircle className="text-green-400" /> : <FaRegSquare className="text-yellow-300" />} {t.titulo}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{t.descripcion}</p>
              <div className="text-sm flex flex-wrap gap-2 mt-2">
                {t.fecha && <span className="bg-gray-700 px-2 py-0.5 rounded">📅 {t.fecha}</span>}
                {t.hora && <span className="bg-gray-700 px-2 py-0.5 rounded">⏰ {t.hora}</span>}
                {t.categoria && <span className="bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><FaTag /> {t.categoria}</span>}
                {t.nota && <span className="bg-purple-700 px-2 py-0.5 rounded">📝 Nota</span>}
                {t.enlace && <a href={t.enlace} target="_blank" rel="noopener noreferrer" className="bg-cyan-700 px-2 py-0.5 rounded flex items-center gap-1"><FaExternalLinkAlt /> Enlace</a>}
                {t.archivoUrl && <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer" className="bg-teal-700 px-2 py-0.5 rounded flex items-center gap-1"><FaPaperclip /> Archivo</a>}
              </div>
              {/* Acciones al pie */}
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => {
                  setModoEdicion(t._id);
                  setTitulo(t.titulo);
                  setDescripcion(t.descripcion);
                  setFecha(t.fecha);
                  setHora(t.hora);
                  setCategoria(t.categoria);
                  setNota(t.nota);
                  setEnlace(t.enlace);
                  setSubtareas(t.subtareas || []);
                }} className="text-yellow-400 hover:text-yellow-200">✏️ Editar</button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const nuevoEstado = t.estado === 'pendiente' ? 'completada' : 'pendiente';
                    const res = await fetch(`${API}/api/tasks/${t._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ estado: nuevoEstado }),
                    });
                    if (res.ok) {
                      setTareas(prev => prev.map(task => task._id === t._id ? { ...task, estado: nuevoEstado } : task));
                    }
                  }}
                  className="text-green-400 hover:text-green-200"
                >{t.estado === 'pendiente' ? '✅ Marcar como completada' : '⏳ Marcar como pendiente'}</button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API}/api/tasks/${t._id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      setTareas(prev => prev.filter(task => task._id !== t._id));
                    }
                  }}
                  className="text-red-500 hover:text-red-300"
                >🗑️ Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tareas;
