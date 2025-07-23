// ✅ TAREAS.JSX CON CATEGORÍA, SUBTAREAS, FILTROS Y CHIPS DE CATEGORÍA
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaRedo, FaArrowLeft, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({ titulo: '', descripcion: '', fecha: '', categoria: '' });
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

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
        body: JSON.stringify({ titulo, descripcion, fecha, categoria, subtareas: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => [...prev, data]);
        setTitulo('');
        setDescripcion('');
        setFecha('');
        setCategoria('');
        setError('');
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

  const tareasFiltradas = tareas.filter(t => {
    const coincideCategoria = categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro;
    const coincideFecha = !fechaFiltro || t.fecha === fechaFiltro;
    return coincideCategoria && coincideFecha;
  });

  const coloresCategoria = ['bg-pink-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">📋 Tareas</h2>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-white hover:text-blue-400">
          <FaArrowLeft /> Volver
        </button>
      </div>
      <div className="mb-6 space-y-3">
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Categoría (opcional)" className="w-full p-2 rounded bg-gray-700 text-white" />
        <button onClick={crearTarea} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold">Crear Tarea</button>

        <div className="flex flex-wrap gap-2">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="bg-gray-700 text-white p-2 rounded">
            <option value="Todas">Todas las categorías</option>
            {[...new Set(tareas.map(t => t.categoria).filter(Boolean))].map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="p-2 rounded bg-gray-700 text-white" />
        </div>
      </div>

      {error && <p className="text-red-400 mb-4 font-medium">{error}</p>}
      {cargando ? (
        <p className="text-gray-400">Cargando tareas...</p>
      ) : (
        tareasFiltradas.map((t, idx) => (
          <div key={t._id} className={`bg-gray-700 p-4 rounded mb-4 ${t.estado === 'completada' ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-white uppercase">{t.titulo}</h4>
                <p className="text-sm text-gray-300">{t.descripcion}</p>
                <p className="text-xs text-gray-400 mt-1">Vence: {t.fecha}</p>
                {t.categoria && (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold text-white px-2 py-1 rounded-full ${coloresCategoria[idx % coloresCategoria.length]}`}>
                    <FaTag /> {t.categoria}
                  </span>
                )}
                <p className={`text-xs font-semibold ${t.estado === 'completada' ? 'text-green-400' : 'text-yellow-400'}`}>{t.estado}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleEstado(t)} className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-white text-sm">
                  {t.estado === 'pendiente' ? <FaCheckCircle /> : <FaRedo />}
                </button>
                <button onClick={() => {
                  setModoEdicion(t._id);
                  setEditData({ titulo: t.titulo, descripcion: t.descripcion, fecha: t.fecha, categoria: t.categoria || '' });
                }} className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white text-sm">
                  <FaEdit />
                </button>
                <button onClick={() => eliminarTarea(t._id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-sm">
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Tareas;
