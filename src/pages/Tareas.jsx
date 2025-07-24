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
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', categoria: '', subtareas: [] });
  const [nuevaSubtareaEdit, setNuevaSubtareaEdit] = useState('');
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => { Notification.requestPermission(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      tareas.forEach(t => {
        if (
          t.estado === 'pendiente' &&
          t.fecha === ahora.toISOString().split('T')[0] &&
          t.hora &&
          new Date(`${t.fecha}T${t.hora}`) <= ahora
        ) {
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
        const res = await fetch(`${API}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const ordenadas = data.sort((a, b) => {
            if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
            return new Date(a.fecha) - new Date(b.fecha);
          });
          setTareas(ordenadas);
        } else {
          setError(data.error || 'No se pudieron cargar las tareas.');
        }
      } catch (err) {
        setError('Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    };
    obtenerTareas();
  }, []);

  const crearTarea = async () => {
    const token = localStorage.getItem('token');
    if (!titulo.trim()) return setError('El título es obligatorio.');
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, subtareas })
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => [...prev, data]);
        setTitulo(''); setDescripcion(''); setFecha(''); setHora(''); setCategoria(''); setSubtareas([]);
      } else {
        setError(data.error || 'Error al crear tarea.');
      }
    } catch (err) {
      setError('Error de red.');
    }
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setTareas(prev => prev.filter(t => t._id !== id));
  };

  const toggleEstado = async (tarea) => {
    const token = localStorage.getItem('token');
    const nuevoEstado = tarea.estado === 'pendiente' ? 'completada' : 'pendiente';
    await fetch(`${API}/api/tasks/${tarea._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setTareas(prev => prev.map(t => t._id === tarea._id ? { ...t, estado: nuevoEstado } : t));
  };

  const guardarEdicion = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editData),
    });
    setTareas(prev => prev.map(t => t._id === id ? { ...t, ...editData } : t));
    setModoEdicion(null);
    setNuevaSubtareaEdit('');
  };

  const agregarSubtarea = () => {
    if (subtareasInput.trim()) {
      setSubtareas(prev => [...prev, { texto: subtareasInput, completado: false }]);
      setSubtareasInput('');
    }
  };

  const agregarSubtareaEdicion = () => {
    if (nuevaSubtareaEdit.trim()) {
      setEditData(prev => ({ ...prev, subtareas: [...prev.subtareas, { texto: nuevaSubtareaEdit, completado: false }] }));
      setNuevaSubtareaEdit('');
    }
  };

  const categoriasUnicas = [...new Set(tareas.map(t => t.categoria).filter(Boolean))];
  const tareasFiltradas = tareas.filter(t =>
    (categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro) &&
    (!fechaFiltro || t.fecha === fechaFiltro)
  );

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
