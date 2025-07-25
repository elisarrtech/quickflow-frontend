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
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');


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
          const ordenadas = data.sort((a, b) => a.estado !== b.estado ? (a.estado === 'pendiente' ? -1 : 1) : new Date(a.fecha) - new Date(b.fecha));
          setTareas(ordenadas);
        }
      } catch {}
    };
    obtenerTareas();
  }, []);

  const categoriasUnicas = [...new Set(tareaFiltradas.map(t => t.categoria).filter(c => c))];
 


const tareasFiltradas = tareas.filter(t => {
  const cumpleCategoria = !filtroCategoria || t.categoria === filtroCategoria;
  const cumpleEstado = !filtroEstado || t.estado === filtroEstado;
  const cumpleDesde = !filtroDesde || new Date(t.fecha) >= new Date(filtroDesde);
  const cumpleHasta = !filtroHasta || new Date(t.fecha) <= new Date(filtroHasta);
  return cumpleCategoria && cumpleEstado && cumpleDesde && cumpleHasta;
});


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

  const limpiarFormulario = () => {
    setTitulo(''); setDescripcion(''); setFecha(''); setHora(''); setCategoria(''); setNota(''); setEnlace(''); setSubtareas([]); setArchivo(null); setError('');
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setTareas(prev => prev.filter(t => t._id !== id));
  };

  const editarTarea = (t) => {
    setModoEdicion(t._id);
    setTitulo(t.titulo);
    setDescripcion(t.descripcion);
    setFecha(t.fecha);
    setHora(t.hora);
    setCategoria(t.categoria);
    setNota(t.nota || '');
    setEnlace(t.enlace || '');
    setSubtareas(t.subtareas || []);
    setArchivo(null);
    setError('');
  };

  const actualizarTarea = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${modoEdicion}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, nota, enlace, subtareas })
    });
    const data = await res.json();
    if (res.ok) {
      setTareas(prev => prev.map(t => t._id === modoEdicion ? data : t));
      setModoEdicion(null);
      limpiarFormulario();
    }
  };

  const toggleEstado = async (t) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${t._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, estado: t.estado === 'pendiente' ? 'completada' : 'pendiente' })
    });
    if (res.ok) setTareas(prev => prev.map(x => x._id === t._id ? { ...x, estado: x.estado === 'pendiente' ? 'completada' : 'pendiente' } : x));
  };

  const toggleSubtarea = (id, i) => {
    setTareas(prev => prev.map(t => {
      if (t._id === id) {
        const s = [...t.subtareas];
        s[i].completado = !s[i].completado;
        return { ...t, subtareas: s };
      }
      return t;
    }));
  };

  const eliminarSubtarea = (index) => {
    setSubtareas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-white">{modoEdicion ? 'Editar Tarea' : 'Nueva Tarea'}</h1>

        {error && <div className="bg-red-600 text-white p-2 mb-4 rounded">{error}</div>}

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
                  <button onClick={() => eliminarSubtarea(i)} className="text-red-400 hover:text-red-600">
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={modoEdicion ? actualizarTarea : crearTarea}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            {modoEdicion ? 'Actualizar' : 'Crear'} tarea
          </button>
        </div>
<div className="grid md:grid-cols-4 gap-4 mb-4 text-white">
  <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="input bg-gray-800 text-white">
    <option value="">Todas las categorías</option>
    {categoriasUnicas.map((cat, i) => (
      <option key={i} value={cat}>{cat}</option>
    ))}
  </select>

  <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="input bg-gray-800 text-white">
    <option value="">Todos los estados</option>
    <option value="pendiente">Pendientes</option>
    <option value="completada">Completadas</option>
  </select>

  <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="input bg-gray-800 text-white" />
  <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="input bg-gray-800 text-white" />
</div>

<button onClick={() => {
  setFiltroCategoria('');
  setFiltroEstado('');
  setFiltroDesde('');
  setFiltroHasta('');
}} className="mb-6 bg-blue-700 hover:bg-blue-600 text-white px-4 py-1 rounded">
  Limpiar filtros
</button>

        <h2 className="text-xl font-semibold mb-4">Tus tareas</h2>

        <div className="space-y-4">
          {tareas.map(t => (
            <div key={t._id} className={`p-4 rounded border ${t.estado === 'completada' ? 'border-green-600 bg-green-900/20' : 'border-yellow-500 bg-yellow-900/10'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {t.estado === 'completada' ? <FaCheckCircle className="text-green-400" /> : <FaRegSquare className="text-yellow-300" />}
                  {t.titulo}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => toggleEstado(t)} title="Cambiar estado">
                    <FaCheckCircle className="text-green-500 hover:text-green-300" />
                  </button>
                  <button onClick={() => editarTarea(t)} title="Editar">
                    <FaEdit className="text-blue-400 hover:text-blue-300" />
                  </button>
                  <button onClick={() => eliminarTarea(t._id)} title="Eliminar">
                    <FaTrashAlt className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
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
              {t.subtareas?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {t.subtareas.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <button onClick={() => toggleSubtarea(t._id, i)}>
                        {s.completado ? <FaCheckSquare className="text-green-400" /> : <FaRegSquare className="text-gray-400" />}
                      </button>
                      <span className={s.completado ? 'line-through text-gray-400' : ''}>{s.texto}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tareas;
