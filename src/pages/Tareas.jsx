// ✅ TAREAS.JSX COMPLETO CON TODAS LAS FUNCIONALIDADES INTEGRADAS Y CORREGIDAS
// ⚠️ Incluye: subtareas, categorías, filtros, recordatorios, notificaciones, adjuntos

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaRedo, FaTag, FaPlus, FaTimes, FaArrowLeft, FaPaperclip } from 'react-icons/fa';
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
  const [archivo, setArchivo] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', categoria: '', subtareas: [] });
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [nota, setNota] = useState('');


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
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descripcion', descripcion);
      formData.append('fecha', fecha);
      formData.append('hora', hora);
      formData.append('categoria', categoria);
      formData.append('subtareas', JSON.stringify(subtareas));
      formData.append('nota', nota);

      if (archivo) formData.append('archivo', archivo);

      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => [...prev, data]);
        setTitulo(''); setDescripcion(''); setFecha(''); setHora(''); setCategoria(''); setSubtareas([]); setArchivo(null);
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
    <div className="text-white p-4 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-white hover:text-blue-400 mb-4">
        <FaArrowLeft className="mr-2" /> Volver al Dashboard
      </button>

      <div className="text-white text-sm mb-2">🔔 Las notificaciones del navegador deben estar activadas.</div>

      {/* Formulario para crear tareas */}
      <div className="space-y-2">
        <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="text" placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />

        <div className="flex items-center gap-2">
          <input type="text" placeholder="Subtarea..." value={subtareasInput} onChange={e => setSubtareasInput(e.target.value)} className="flex-1 p-2 rounded bg-gray-700 text-white" />
          <button onClick={agregarSubtarea} className="bg-green-600 text-white p-2 rounded"><FaPlus /></button>
        </div>

        <textarea placeholder="Nota larga (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white"/>


        {/* Input para adjuntar archivo */}
        <input type="file" accept=".pdf,image/*" onChange={(e) => setArchivo(e.target.files[0])} className="w-full p-2 bg-gray-800 text-white rounded" />

        <button onClick={crearTarea} className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Crear Tarea</button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mt-4">
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="p-2 bg-gray-700 text-white rounded">
          <option value="Todas">Todas las categorías</option>
          {categoriasUnicas.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
        </select>
        <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="p-2 bg-gray-700 text-white rounded" />
      </div>

      {/* Lista de tareas */}
      <div className="mt-6 space-y-4">
        {tareasFiltradas.map((tarea) => (
          <div key={tarea._id} className="bg-gray-700 p-4 rounded text-white">
            <h3 className="text-xl font-bold">{tarea.titulo}</h3>
            <p className="text-sm">{tarea.descripcion}</p>
            {tarea.nota && (
            <div className="mt-2 bg-gray-800 text-sm text-gray-300 p-2 rounded">
            📝 <span className="font-semibold">Nota:</span><br />{tarea.nota}
      </div>
      )}

            <p className="text-sm">📅 {tarea.fecha} {tarea.hora && `🕒 ${tarea.hora}`}</p>
            {tarea.categoria && <span className="inline-flex items-center bg-blue-600 text-white px-2 py-1 rounded text-xs mt-2"><FaTag className="mr-1" />{tarea.categoria}</span>}
            <ul className="list-disc ml-5 mt-2 text-sm">
              {tarea.subtareas && tarea.subtareas.map((sub, i) => <li key={i}>{sub.texto}</li>)}
            </ul>
            {tarea.archivo && <a href={`${API}/${tarea.archivo}`} target="_blank" className="text-blue-400 mt-2 inline-flex items-center"><FaPaperclip className="mr-1" /> Ver archivo</a>}
            <p className={`text-xs mt-1 ${tarea.estado === 'pendiente' ? 'text-yellow-400' : 'text-green-400'}`}>{tarea.estado}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => toggleEstado(tarea)} className="text-blue-400"><FaCheckCircle /></button>
              <button onClick={() => {
                setModoEdicion(tarea._id);
                setEditData({
                  titulo: tarea.titulo,
                  descripcion: tarea.descripcion,
                  fecha: tarea.fecha,
                  hora: tarea.hora || '',
                  categoria: tarea.categoria || '',
                  subtareas: tarea.subtareas || []
                });
              }} className="text-yellow-400"><FaEdit /></button>
              <button onClick={() => eliminarTarea(tarea._id)} className="text-red-500"><FaTrashAlt /></button>
            </div>

            {/* Modo edición */}
            {modoEdicion === tarea._id && (
              <div className="mt-4 space-y-2">
                <input value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} className="w-full p-1 rounded bg-gray-800 text-white" />
                <textarea value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full p-1 rounded bg-gray-800 text-white" />
                <input type="date" value={editData.fecha} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="w-full p-1 rounded bg-gray-800 text-white" />
                <input type="time" value={editData.hora} onChange={e => setEditData({ ...editData, hora: e.target.value })} className="w-full p-1 rounded bg-gray-800 text-white" />
                <input value={editData.categoria} onChange={e => setEditData({ ...editData, categoria: e.target.value })} className="w-full p-1 rounded bg-gray-800 text-white" />
                <button onClick={() => guardarEdicion(tarea._id)} className="bg-green-600 text-white px-4 py-1 rounded">Guardar</button>
                <button onClick={() => setModoEdicion(null)} className="text-white text-xs ml-4">Cancelar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tareas;
