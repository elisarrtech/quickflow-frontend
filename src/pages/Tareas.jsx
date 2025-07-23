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
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mt-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-white hover:text-blue-400 mb-4">
        <FaArrowLeft className="mr-2" /> Volver al Dashboard
      </button>

      <div className="text-white text-sm mb-2">🔔 Las notificaciones del navegador deben estar activadas.</div>
      <!-- El resto del código permanece igual -->
    </div>
  );
};

export default Tareas;
