// ✅ TAREAS.JSX CON CATEGORÍA, SUBTAREAS, FILTROS, CHIPS, CHECKLIST EDITABLE Y EDICIÓN FUNCIONAL
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaRedo, FaArrowLeft, FaTag, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subtareasInput, setSubtareasInput] = useState('');
  const [subtareas, setSubtareas] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({ titulo: '', descripcion: '', fecha: '', categoria: '', subtareas: [] });
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
        body: JSON.stringify({ titulo, descripcion, fecha, categoria, subtareas }),
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => [...prev, data]);
        setTitulo('');
        setDescripcion('');
        setFecha('');
        setCategoria('');
        setSubtareas([]);
        setSubtareasInput('');
        setError('');
      } else {
        setError(data.error || 'Error al crear tarea.');
      }
    } catch (err) {
      setError('Error de red.');
    }
  };

  const guardarEdicion = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setTareas(prev => prev.map(t => t._id === id ? { ...t, ...editData } : t));
        setModoEdicion(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar tarea.');
      }
    } catch (err) {
      setError('Error de red.');
    }
  };

  const agregarSubtarea = () => {
    if (subtareasInput.trim()) {
      setSubtareas([...subtareas, { titulo: subtareasInput, completada: false }]);
      setSubtareasInput('');
    }
  };

  const tareasFiltradas = tareas.filter(t => {
    const coincideCategoria = categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro;
    const coincideFecha = !fechaFiltro || t.fecha === fechaFiltro;
    return coincideCategoria && coincideFecha;
  });

  const coloresCategoria = ['bg-pink-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
  const categoriasUnicas = [...new Set(tareas.map(t => t.categoria).filter(Boolean))];

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">📋 Tareas</h2>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-white hover:text-blue-400">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="p-2 bg-gray-700 text-white rounded">
          <option value="Todas">Todas las categorías</option>
          {categoriasUnicas.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="p-2 bg-gray-700 text-white rounded" />
      </div>

      {modoEdicion && (
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <h3 className="text-white mb-2">Editar tarea</h3>
          <input value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input type="date" value={editData.fecha} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input value={editData.categoria} onChange={e => setEditData({ ...editData, categoria: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <div className="flex gap-2">
            <button onClick={() => guardarEdicion(modoEdicion)} className="bg-green-600 px-3 py-1 rounded text-white">Guardar</button>
            <button onClick={() => setModoEdicion(null)} className="bg-gray-500 px-3 py-1 rounded text-white">Cancelar</button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mb-4 font-medium">{error}</p>}

      {cargando ? (
        <p className="text-gray-400">Cargando tareas...</p>
      ) : (
        tareasFiltradas.map((t, index) => {
          const chipColor = coloresCategoria[index % coloresCategoria.length];
          return (
            <div key={t._id} className="bg-gray-700 p-4 rounded mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h4 className="text-lg font-bold text-white uppercase">{t.titulo}</h4>
                  <p className="text-sm text-gray-300">{t.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-1">Vence: {t.fecha}</p>
                  {t.categoria && (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold text-white ${chipColor} rounded-full mt-1`}>
                      <FaTag className="mr-1" /> {t.categoria}
                    </span>
                  )}
                  {Array.isArray(t.subtareas) && t.subtareas.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {t.subtareas.map((sub, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                          <input type="checkbox" checked={sub.completada} readOnly className="accent-green-500" />
                          <span className={sub.completada ? 'line-through text-gray-400' : ''}>{sub.titulo}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Tareas;
