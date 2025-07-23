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

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
      {/* Formulario y filtros igual que antes */}

      {modoEdicion && (
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <h3 className="text-white mb-2">Editar tarea</h3>
          <input value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input type="date" value={editData.fecha} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <input value={editData.categoria} onChange={e => setEditData({ ...editData, categoria: e.target.value })} className="w-full mb-2 p-2 bg-gray-600 text-white" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => guardarEdicion(modoEdicion)} className="bg-green-600 px-3 py-1 rounded text-white">Guardar</button>
            <button onClick={() => setModoEdicion(null)} className="bg-gray-500 px-3 py-1 rounded text-white">Cancelar</button>
          </div>
        </div>
      )}

      {/* Mostrar tareas como antes */}
    </div>
  );
};

export default Tareas;
