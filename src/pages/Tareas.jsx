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
  FaTimes
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
        <h1 className="text-2xl font-bold mb-4 text-white">Nueva Tarea</h1>

        <div className="flex gap-2 mb-4">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded">
            <option value="">Todas las categorías</option>
            {[...new Set(tareas.map(t => t.categoria))].map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
          </select>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded" />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded" />
          <button onClick={limpiarFiltros} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Limpiar filtros</button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <input type="text" placeholder="Título" className="input bg-gray-800 text-white" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <input type="text" placeholder="Descripción" className="input bg-gray-800 text-white" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <input type="date" className="input bg-gray-800 text-white" value={fecha} onChange={e => setFecha(e.target.value)} />
          <input type="time" className="input bg-gray-800 text-white" value={hora} onChange={e => setHora(e.target.value)} />
          <input type="text" placeholder="Categoría" className="input bg-gray-800 text-white" value={categoria} onChange={e => setCategoria(e.target.value)} />
          <input type="text" placeholder="Enlace relacionado" className="input bg-gray-800 text-white" value={enlace} onChange={e => setEnlace(e.target.value)} />
          <input type="file" className="input bg-gray-800 text-white" onChange={e => setArchivo(e.target.files[0])} />
          <textarea placeholder="Nota larga" className="input bg-gray-800 text-white" value={nota} onChange={e => setNota(e.target.value)}></textarea>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input type="text" placeholder="Agregar subtarea" className="input flex-1 bg-gray-800 text-white" value={subtareasInput} onChange={e => setSubtareasInput(e.target.value)} />
            <button onClick={() => {
              if (subtareasInput.trim()) {
                setSubtareas([...subtareas, { texto: subtareasInput.trim(), completado: false }]);
                setSubtareasInput('');
              }
            }} className="btn">
              <FaPlus />
            </button>
          </div>

          {subtareas.length > 0 && (
            <ul className="mt-2 space-y-1">
              {subtareas.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span>{s.texto}</span>
                  <button onClick={() => setSubtareas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={crearTarea}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Crear tarea
          </button>
        </div>

        <div className="space-y-4 mt-6">
          {tareasFiltradas.map(t => (
            <div key={t._id} className={`p-4 rounded border ${t.estado === 'completada' ? 'border-green-600 bg-green-900/20' : 'border-yellow-500 bg-yellow-900/10'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {t.estado === 'completada' ? <FaCheckCircle className="text-green-400" /> : <FaRegSquare className="text-yellow-300" />}
                  {t.titulo}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">{t.descripcion}</p>
              <div className="text-sm flex flex-wrap gap-2 mt-2">
                {t.fecha && <span className="bg-gray-700 px-2 py-0.5 rounded">📅 {t.fecha}</span>}
                {t.hora && <span className="bg-gray-700 px-2 py-0.5 rounded">⏰ {t.hora}</span>}
                {t.categoria && <span className="bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><FaTag /> {t.categoria}</span>}
                {t.nota && <span className="bg-purple-700 px-2 py-0.5 rounded">📝 Nota</span>}
                {t.enlace && <a href={t.enlace} target="_blank" rel="noopener noreferrer" className="bg-cyan-700 px-2 py-0.5 rounded flex items-center gap-1"><FaExternalLinkAlt /> Enlace</a>}
                {t.archivoUrl && <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer" className="bg-teal-700 px-2 py-0.5 rounded flex items-center gap-1"><FaPaperclip /> Archivo</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tareas;
