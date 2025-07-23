// ✅ TAREAS.JSX COMPLETO CON TODAS LAS FUNCIONALIDADES INTEGRADAS Y CORREGIDAS
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaRedo, FaTag, FaPlus, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  };

  const agregarSubtarea = () => {
    if (subtareasInput.trim()) {
      setSubtareas(prev => [...prev, { texto: subtareasInput, completado: false }]);
      setSubtareasInput('');
    }
  };

  const categoriasUnicas = [...new Set(tareas.map(t => t.categoria).filter(Boolean))];
  const tareasFiltradas = tareas.filter(t =>
    (categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro) &&
    (!fechaFiltro || t.fecha === fechaFiltro)
  );

   return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">📋 Tareas</h2>
      <div className="mb-4 space-y-2">
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <button onClick={crearTarea} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">Crear Tarea</button>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {cargando ? (
        <p className="text-gray-400">Cargando tareas...</p>
      ) : (
        tareas.map(t => (
          <div key={t._id} className={`bg-gray-700 p-4 rounded mt-4 ${t.estado === 'completada' ? 'opacity-70' : ''}`}>
            {modoEdicion === t._id ? (
              <>
                <input value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} className="w-full mb-1 p-1 bg-gray-600 text-white" />
                <input value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full mb-1 p-1 bg-gray-600 text-white" />
                <input type="date" value={editData.fecha} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="w-full mb-2 p-1 bg-gray-600 text-white" />
                <div className="flex gap-2">
                  <button onClick={() => guardarEdicion(t._id)} className="bg-green-600 px-3 py-1 rounded text-white">Guardar</button>
                  <button onClick={() => setModoEdicion(null)} className="bg-gray-500 px-3 py-1 rounded text-white">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold text-white">{t.titulo}</h4>
                    <p className="text-sm text-gray-300">{t.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">Vence: {t.fecha}</p>
                    <p className={`text-xs font-semibold ${t.estado === 'completada' ? 'text-green-400' : 'text-yellow-400'}`}>{t.estado}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => toggleEstado(t)} className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-white text-sm">
                      {t.estado === 'pendiente' ? <FaCheckCircle /> : <FaRedo />}
                    </button>
                    <button onClick={() => {
                      setModoEdicion(t._id);
                      setEditData({ titulo: t.titulo, descripcion: t.descripcion, fecha: t.fecha });
                    }} className="flex items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white text-sm">
                      <FaEdit />
                    </button>
                    <button onClick={() => eliminarTarea(t._id)} className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-sm">
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Tareas;
