// src/pages/Tareas.jsx
import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaEdit,
  FaTrashAlt,
  FaTag,
  FaExternalLinkAlt,
  FaPaperclip,
  FaCheckSquare,
  FaRegSquare,
  FaUser,
  FaShareAlt,
  FaEnvelope,
  FaWhatsapp,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaGripLines,
  FaPencilAlt,
  FaBell,
  FaEye
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuración del calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

// Colores por categoría
const coloresPorCategoria = {
  trabajo: 'bg-blue-600',
  personal: 'bg-green-600',
  urgente: 'bg-red-600',
  estudio: 'bg-purple-600',
  otros: 'bg-gray-600'
};

// Prioridades
const PRIORIDADES = {
  alta: { label: 'Alta', color: 'bg-red-600' },
  media: { label: 'Media', color: 'bg-yellow-500' },
  baja: { label: 'Baja', color: 'bg-green-600' }
};

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subtareas, setSubtareas] = useState([]);
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enlace, setEnlace] = useState('');
  const [nota, setNota] = useState('');
  const [modoEdicion, setModoEdicion] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categoriasExistentes, setCategoriasExistentes] = useState([]);
  const [asignadoAFiltro, setAsignadoAFiltro] = useState('');
  const [asignadoA, setAsignadoA] = useState('');
  const [compartirMenuAbierto, setCompartirMenuAbierto] = useState(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [editandoSubtarea, setEditandoSubtarea] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [tareasRecientes, setTareasRecientes] = useState([]);
  const [comentario, setComentario] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [activeTab, setActiveTab] = useState('lista'); // Pestaña activa

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Solicitar permiso para notificaciones
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // Cargar tareas recientes desde localStorage
  useEffect(() => {
    const guardadas = localStorage.getItem('tareasRecientes');
    if (guardadas) {
      setTareasRecientes(JSON.parse(guardadas));
    }
  }, []);

  // Obtener tareas del backend
  const obtenerTareas = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://peppy-starlight-fd4c37.netlify.app'
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('Sesión inválida. Redirigiendo al login...');
          setTimeout(() => {
            navigate('/login');
            localStorage.removeItem('token');
          }, 2000);
        } else {
          setError(`Error ${res.status}: ${errorData.error || 'No se pudieron cargar las tareas'}`);
        }
        return;
      }
      const data = await res.json();
      const tareasArray = Array.isArray(data) ? data : data.tareas || [];
      const tareasConSubtareas = tareasArray.map(t => ({
        ...t,
        subtareas: Array.isArray(t.subtareas)
          ? t.subtareas.map(s => typeof s === 'string' ? { texto: s, completada: false } : s)
          : [],
        prioridad: t.prioridad || 'media',
        comentarios: Array.isArray(t.comentarios) ? t.comentarios : [],
        historial: Array.isArray(t.historial) ? t.historial : []
      }));
      setTareas(tareasConSubtareas);
      const categorias = [...new Set(tareasConSubtareas.map(t => t.categoria).filter(Boolean))];
      setCategoriasExistentes(categorias);
    } catch (error) {
      console.error('🔴 Error de red al obtener tareas:', error);
      setError('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
  };

  useEffect(() => {
    obtenerTareas();
  }, [API, navigate]);

  // Drag & Drop en Kanban
  const onDragEndKanban = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const items = Array.from(tareas);
    const [movedItem] = items.splice(source.index, 1);
    const updatedItem = { ...movedItem, estado: destination.droppableId };
    items.splice(destination.index, 0, updatedItem);
    setTareas(items);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/tasks/${movedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: destination.droppableId })
      });
      if (!res.ok) setTareas(tareas);
    } catch (error) {
      setTareas(tareas);
    }
  };

  // Drag & Drop en subtareas
  const onDragEndSubtareas = (result, tareaId) => {
    if (!result.destination) return;
    const tarea = tareas.find(t => t._id === tareaId);
    if (!tarea) return;
    const newSubtareas = Array.from(tarea.subtareas);
    const [reordered] = newSubtareas.splice(result.source.index, 1);
    newSubtareas.splice(result.destination.index, 0, reordered);
    const updatedTarea = { ...tarea, subtareas: newSubtareas };
    setTareas(prev => prev.map(t => (t._id === tareaId ? updatedTarea : t)));
    if (modoEdicion && tareaId === modoEdicion) {
      setSubtareas(newSubtareas);
    }
    if (tareaSeleccionada?._id === tareaId) {
      setTareaSeleccionada(updatedTarea);
    }
  };

  // Filtros
  const filtrarTareas = () => {
    let filtradas = [...tareas];
    if (categoriaFiltro) filtradas = filtradas.filter(t => t.categoria === categoriaFiltro);
    if (estadoFiltro) filtradas = filtradas.filter(t => t.estado === estadoFiltro);
    if (asignadoAFiltro) filtradas = filtradas.filter(t => t.asignadoA?.toLowerCase().includes(asignadoAFiltro.toLowerCase()));
    if (fechaInicio && !fechaFin) filtradas = filtradas.filter(t => t.fecha === fechaInicio);
    if (fechaInicio && fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha) >= new Date(fechaInicio) && new Date(t.fecha) <= new Date(fechaFin));
    return filtradas;
  };

  const filtrarPorBusqueda = (tareas) => {
    if (!busqueda.trim()) return tareas;
    const busq = busqueda.toLowerCase();
    return tareas.filter(t =>
      t.titulo.toLowerCase().includes(busq) ||
      t.descripcion?.toLowerCase().includes(busq) ||
      t.nota?.toLowerCase().includes(busq) ||
      t.categoria?.toLowerCase().includes(busq) ||
      t.asignadoA?.toLowerCase().includes(busq) ||
      t.subtareas.some(s => s.texto.toLowerCase().includes(busq))
    );
  };

  const tareasFiltradas = filtrarPorBusqueda(filtrarTareas());
  const personasAsignadas = [...new Set(tareas.map(t => t.asignadoA).filter(Boolean))];
  const colorCategoria = (cat) => coloresPorCategoria[cat?.toLowerCase()] || 'bg-gray-600';

  // Formulario
  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setFecha('');
    setHora('');
    setCategoria('');
    setNota('');
    setEnlace('');
    setSubtareas([]);
    setNuevaSubtarea('');
    setArchivo(null);
    setAsignadoA('');
    setError('');
    setExito('');
    setModoEdicion(null);
    setPrioridad('media');
  };

  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setEstadoFiltro('');
    setFechaInicio('');
    setFechaFin('');
    setAsignadoAFiltro('');
    setBusqueda('');
  };

  const crearTarea = async () => {
    if (!titulo.trim()) return setError('El título es obligatorio');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('categoria', categoria);
    formData.append('nota', nota);
    formData.append('enlace', enlace);
    formData.append('asignadoA', asignadoA);
    formData.append('estado', 'pendiente');
    formData.append('subtareas', JSON.stringify(subtareas));
    formData.append('prioridad', prioridad);
    if (archivo) formData.append('archivo', archivo);
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const tareaConSubtareas = {
          ...data,
          subtareas: data.subtareas?.map(s => typeof s === 'string' ? { texto: s, completada: false } : s) || [],
          prioridad: data.prioridad || 'media',
          comentarios: data.comentarios || [],
          historial: data.historial || []
        };
        setTareas(prev => [...prev, tareaConSubtareas]);
        setExito('✅ Tarea creada con éxito.');
        limpiarFormulario();
        setTimeout(() => setExito(''), 3000);
        if (!categoriasExistentes.includes(data.categoria)) {
          setCategoriasExistentes(prev => [...prev, data.categoria]);
        }
      } else {
        setError(data.error || 'Error al crear la tarea');
      }
    } catch (error) {
      setError('Error de red al crear la tarea');
    }
  };

  const guardarEdicion = async () => {
    if (!modoEdicion) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tasks/${modoEdicion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, nota, enlace, asignadoA, subtareas, prioridad })
      });
      const data = await res.json();
      if (res.ok) {
        const tareaActualizada = {
          ...data,
          subtareas: data.subtareas?.map(s => typeof s === 'string' ? { texto: s, completada: false } : s) || [],
          prioridad: data.prioridad || 'media',
          comentarios: data.comentarios || [],
          historial: data.historial || []
        };
        setTareas(prev => prev.map(t => (t._id === modoEdicion ? tareaActualizada : t)));
        setExito('✅ Tarea actualizada.');
        limpiarFormulario();
        setTimeout(() => setExito(''), 3000);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch (error) {
      setError('Error de red al actualizar');
    }
  };

  // Compartir
  const compartirPorCorreo = (tarea) => {
    const asunto = encodeURIComponent(`Tarea: ${tarea.titulo}`);
    const cuerpo = encodeURIComponent(
      `Hola,
Título: ${tarea.titulo}
Descripción: ${tarea.descripcion || 'Sin descripción'}
Fecha: ${tarea.fecha || 'Sin fecha'}
Hora: ${tarea.hora || 'Sin hora'}
Categoría: ${tarea.categoria || 'Sin categoría'}
Asignado a: ${tarea.asignadoA || 'No asignado'}${tarea.enlace ? `
Enlace: ${tarea.enlace}` : ''}${tarea.nota ? `
Nota: ${tarea.nota}` : ''}${tarea.subtareas?.length > 0 ? `
Subtareas:
${tarea.subtareas.map(s => `- [${s.completada ? 'x' : ' '}] ${s.texto}`).join('\n')}` : ''}`
    );
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  };

  const compartirPorWhatsApp = (tarea) => {
    const texto = encodeURIComponent(
      `*Tarea: ${tarea.titulo}*
Descripción: ${tarea.descripcion || 'Sin descripción'}
Fecha: ${tarea.fecha || 'Sin fecha'}
Hora: ${tarea.hora || 'Sin hora'}
Categoría: ${tarea.categoria || 'Sin categoría'}
Asignado a: ${tarea.asignadoA || 'No asignado'}${tarea.enlace ? `
🔗 Enlace: ${tarea.enlace}` : ''}${tarea.nota ? `
📝 Nota: ${tarea.nota}` : ''}${tarea.subtareas?.length > 0 ? `
✅ Subtareas:
${tarea.subtareas.map(s => `• ${s.completada ? '✔️' : '☐'} ${s.texto}`).join('\n')}` : ''}`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  const mostrarNotificacion = (titulo, cuerpo) => {
    if (Notification.permission === 'granted') {
      new Notification(titulo, { body: cuerpo, icon: '/favicon.ico' });
    }
  };

  // Tareas recientes con persistencia
  const actualizarTareasRecientes = (tareaId) => {
    setTareasRecientes(prev => {
      const nuevas = [tareaId, ...prev.filter(id => id !== tareaId)].slice(0, 5);
      localStorage.setItem('tareasRecientes', JSON.stringify(nuevas));
      return nuevas;
    });
  };

  // Preparar eventos para el calendario
  const eventosCalendario = tareas
    .filter(t => t.fecha)
    .map(t => {
      const start = t.fecha && t.hora
        ? new Date(`${t.fecha}T${t.hora}`)
        : t.fecha
        ? new Date(`${t.fecha}T09:00:00`)
        : new Date();

      const end = new Date(start);
      end.setHours(end.getHours() + 1); // Duración de 1 hora

      return {
        id: t._id,
        title: t.titulo,
        start,
        end,
        allDay: !t.hora,
        resource: t // Guardamos la tarea completa
      };
    });

  return (
    <div className="text-white p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {exito && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {exito}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Título */}
      <h1 className="text-2xl font-bold mb-6">Mis Tareas</h1>

      {/* Pestañas */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('lista')}
          className={`px-6 py-3 font-semibold transition ${activeTab === 'lista' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Lista
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-6 py-3 font-semibold transition ${activeTab === 'kanban' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Kanban
        </button>
        <button
          onClick={() => setActiveTab('calendario')}
          className={`px-6 py-3 font-semibold transition ${activeTab === 'calendario' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Calendario
        </button>
      </div>

      {/* === PESTAÑA: LISTA === */}
      {activeTab === 'lista' && (
        <div>
          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar tareas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Filtros */}
          <div className="sticky top-0 z-40 bg-gray-900 p-4 rounded-t-lg border-b border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Filtros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="input bg-gray-800 text-white p-2 rounded text-sm">
                <option value="">Todas</option>
                {categoriasExistentes.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="input bg-gray-800 text-white p-2 rounded text-sm">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
              </select>
              <select value={asignadoAFiltro} onChange={e => setAsignadoAFiltro(e.target.value)} className="input bg-gray-800 text-white p-2 rounded text-sm">
                <option value="">Todos</option>
                {personasAsignadas.map(persona => (
                  <option key={persona} value={persona}>{persona}</option>
                ))}
              </select>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input bg-gray-800 text-white p-2 rounded text-sm" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input bg-gray-800 text-white p-2 rounded text-sm" />
            </div>
            <button onClick={limpiarFiltros} className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Limpiar filtros</button>
          </div>

          {/* Formulario */}
          <div className="bg-gray-900 p-4 rounded mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">{modoEdicion ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
            <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white p-2 rounded" />
            <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white p-2 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input bg-gray-800 text-white p-2 rounded" />
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="input bg-gray-800 text-white p-2 rounded" />
              <input placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="input bg-gray-800 text-white p-2 rounded" />
              <input placeholder="Enlace" value={enlace} onChange={e => setEnlace(e.target.value)} className="input bg-gray-800 text-white p-2 rounded" />
              <select value={prioridad} onChange={e => setPrioridad(e.target.value)} className="input bg-gray-800 text-white p-2 rounded">
                {Object.entries(PRIORIDADES).map(([key, { label }]) => (
                  <option key={key} value={key}>Prioridad: {label}</option>
                ))}
              </select>
            </div>
            <input placeholder="Asignar a" value={asignadoA} onChange={e => setAsignadoA(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white p-2 rounded" />
            <textarea placeholder="Nota" value={nota} onChange={e => setNota(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white p-2 rounded" />

            {/* Subtareas */}
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-white">
                Subtareas
                <span className="text-xs text-gray-400">(doble clic o lápiz para editar)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Escribe una subtarea"
                  value={nuevaSubtarea}
                  onChange={e => setNuevaSubtarea(e.target.value)}
                  className="input flex-1 bg-gray-800 text-white p-2 rounded"
                  onKeyPress={e => {
                    if (e.key === 'Enter' && nuevaSubtarea.trim()) {
                      setSubtareas([...subtareas, { texto: nuevaSubtarea.trim(), completada: false }]);
                      setNuevaSubtarea('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nuevaSubtarea.trim()) {
                      setSubtareas([...subtareas, { texto: nuevaSubtarea.trim(), completada: false }]);
                      setNuevaSubtarea('');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                >
                  + Agregar
                </button>
              </div>
              {subtareas.length > 0 && (
                <DragDropContext onDragEnd={(result) => onDragEndSubtareas(result, 'form')}>
                  <Droppable droppableId="subtareas-form">
                    {(provided) => (
                      <ul ref={provided.innerRef} {...provided.droppableProps} className="list-none text-sm text-gray-300 space-y-1">
                        {subtareas.map((s, i) => (
                          <Draggable key={`form-${i}`} draggableId={`form-${i}`} index={i}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between bg-gray-800 p-2 rounded"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <FaGripLines className="text-gray-500 cursor-move" />
                                  <input
                                    type="checkbox"
                                    checked={s.completada}
                                    onChange={() => {
                                      const updated = [...subtareas];
                                      updated[i] = { ...s, completada: !s.completada };
                                      setSubtareas(updated);
                                      if (s.completada === false) {
                                        mostrarNotificacion('✅ Subtarea completada', `"${s.texto}" ha sido completada.`);
                                      }
                                    }}
                                    className="text-green-500"
                                  />
                                  {editandoSubtarea?.index === i && editandoSubtarea?.origen === 'form' ? (
                                    <input
                                      type="text"
                                      value={editandoSubtarea.valor}
                                      onChange={(e) =>
                                        setEditandoSubtarea({ ...editandoSubtarea, valor: e.target.value })
                                      }
                                      onBlur={() => {
                                        const updated = [...subtareas];
                                        updated[i] = { ...s, texto: editandoSubtarea.valor.trim() || s.texto };
                                        setSubtareas(updated);
                                        setEditandoSubtarea(null);
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          const updated = [...subtareas];
                                          updated[i] = { ...s, texto: editandoSubtarea.valor.trim() || s.texto };
                                          setSubtareas(updated);
                                          setEditandoSubtarea(null);
                                        }
                                      }}
                                      className="bg-gray-700 text-white text-sm px-1 rounded flex-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className={`cursor-pointer ${s.completada ? 'line-through text-gray-400' : ''}`}
                                      onDoubleClick={() => setEditandoSubtarea({ origen: 'form', index: i, valor: s.texto })}
                                    >
                                      {s.texto}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditandoSubtarea({ origen: 'form', index: i, valor: s.texto })}
                                    className="text-yellow-400 hover:text-yellow-600 text-xs"
                                    title="Editar subtarea"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSubtareas(subtareas.filter((_, idx) => idx !== i))}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
            <input type="file" onChange={e => setArchivo(e.target.files[0])} className="input w-full mb-2 bg-gray-800 text-white p-2 rounded" />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={modoEdicion ? guardarEdicion : crearTarea}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {modoEdicion ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>

          {/* Tareas recientes (siempre visible) */}
          <div className="mt-6 p-4 bg-gray-800 rounded mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">🕒 Tareas recientes</h3>
            {tareasRecientes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tareasRecientes.map(recienteId => {
                  const t = tareas.find(t => t._id === recienteId);
                  if (!t) return null;
                  return (
                    <button
                      key={t._id}
                      onClick={() => {
                        setTareaSeleccionada(tareaSeleccionada?._id === t._id ? null : t);
                        actualizarTareasRecientes(t._id);
                      }}
                      className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
                    >
                      {t.titulo.length > 20 ? `${t.titulo.slice(0, 20)}...` : t.titulo}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No has visto ninguna tarea recientemente.</p>
            )}
          </div>

          {/* Lista de tareas */}
          <div className="space-y-4 mt-6">
            {tareasFiltradas.map(t => (
              <div key={t._id} className={`p-3 sm:p-4 rounded border ${t.estado === 'completada' ? 'border-green-600 bg-green-900/20' : 'border-yellow-500 bg-yellow-900/10'}`}>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
                  {t.estado === 'completada' ? <FaCheckCircle className="text-green-400" /> : <FaRegSquare className="text-yellow-300" />} {t.titulo}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{t.descripcion}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.fecha && (
                    <span className="px-2 py-1 rounded text-white text-xs font-semibold bg-purple-600">
                      <FaCalendarAlt className="inline mr-1" /> {t.fecha}
                    </span>
                  )}
                  {t.hora && (
                    <span className="px-2 py-1 rounded text-white text-xs font-semibold bg-pink-500">
                      <FaClock className="inline mr-1" /> {t.hora}
                    </span>
                  )}
                  {t.categoria && (
                    <span className="px-2 py-1 rounded text-white text-xs font-semibold bg-blue-600">
                      <FaTag className="inline mr-1" /> {t.categoria?.toUpperCase()}
                    </span>
                  )}
                  {t.prioridad && (
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${PRIORIDADES[t.prioridad].color}`}>
                      <FaBell className="inline mr-1" /> {PRIORIDADES[t.prioridad].label}
                    </span>
                  )}
                  {t.asignadoA && (
                    <span className="px-2 py-1 rounded text-white text-xs font-semibold bg-gray-600">
                      <FaUser className="inline mr-1" /> {t.asignadoA}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="relative">
                    <button
                      onClick={() => setCompartirMenuAbierto(compartirMenuAbierto === t._id ? null : t._id)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm min-h-10"
                    >
                      <FaShareAlt /> <span className="hidden sm:inline">Compartir</span>
                    </button>
                    {compartirMenuAbierto === t._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                        <button onClick={() => { compartirPorCorreo(t); setCompartirMenuAbierto(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"><FaEnvelope /> Correo</button>
                        <button onClick={() => { compartirPorWhatsApp(t); setCompartirMenuAbierto(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"><FaWhatsapp /> WhatsApp</button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setModoEdicion(t._id);
                      setTitulo(t.titulo);
                      setDescripcion(t.descripcion);
                      setFecha(t.fecha);
                      setHora(t.hora);
                      setCategoria(t.categoria);
                      setNota(t.nota);
                      setEnlace(t.enlace);
                      setAsignadoA(t.asignadoA || '');
                      setSubtareas(t.subtareas || []);
                      setPrioridad(t.prioridad || 'media');
                    }}
                    className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm min-h-10"
                  >
                    <FaEdit /> <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const nuevoEstado = t.estado === 'pendiente' ? 'completada' : 'pendiente';
                      const res = await fetch(`${API}/api/tasks/${t._id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ estado: nuevoEstado })
                      });
                      if (res.ok) setTareas(prev => prev.map(task => (task._id === t._id ? { ...task, estado: nuevoEstado } : task)));
                    }}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm min-h-10"
                  >
                    <FaCheckCircle /> <span className="hidden sm:inline">Completar</span>
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${API}/api/tasks/${t._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                      if (res.ok) setTareas(prev => prev.filter(task => task._id !== t._id));
                    }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm min-h-10"
                  >
                    <FaTrashAlt /> <span className="hidden sm:inline">Eliminar</span>
                  </button>
                  <button
                    onClick={() => {
                      setTareaSeleccionada(tareaSeleccionada?._id === t._id ? null : t);
                      actualizarTareasRecientes(t._id);
                    }}
                    className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-sm min-h-10"
                  >
                    <FaEye />
                    <span>{tareaSeleccionada?._id === t._id ? 'Ver menos' : 'Ver más'}</span>
                  </button>
                </div>
                {tareaSeleccionada?._id === t._id && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-300 animate-fadeIn">
                    {t.nota && (
                      <div className="mb-3">
                        <p className="font-semibold text-white">📝 Nota:</p>
                        <p className="whitespace-pre-line">{t.nota}</p>
                      </div>
                    )}
                    {t.enlace && (
                      <div className="mb-3">
                        <p className="font-semibold text-white">🔗 Enlace:</p>
                        <a href={t.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all">
                          {t.enlace}
                        </a>
                      </div>
                    )}
                    {t.archivoUrl && (
                      <div className="mb-3">
                        <p className="font-semibold text-white">📎 Archivo:</p>
                        <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 underline">
                          Descargar archivo
                        </a>
                      </div>
                    )}
                    {t.subtareas?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-white">✅ Subtareas:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {t.subtareas.map((sub, idx) => (
                            <li key={idx} className={sub.completada ? 'line-through text-gray-400' : ''}>
                              {sub.texto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {t.comentarios?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-white">💬 Comentarios:</p>
                        <ul className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                          {t.comentarios.map((c, i) => (
                            <li key={i} className="bg-gray-800 p-2 rounded text-xs">
                              <p>{c.texto}</p>
                              <p className="text-gray-400">
                                {c.autor} • {new Date(c.fecha).toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="font-semibold text-white">📋 Historial:</p>
                      <ul className="text-xs text-gray-400 space-y-1 max-h-24 overflow-y-auto">
                        {(t.historial || []).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((h, i) => (
                          <li key={i}>{h.accion} • {new Date(h.fecha).toLocaleString()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === PESTAÑA: KANBAN === */}
      {activeTab === 'kanban' && (
        <div>
          <DragDropContext onDragEnd={onDragEndKanban}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['pendiente', 'completada'].map(estado => (
                <Droppable droppableId={estado} key={estado}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-800 rounded-lg p-4 shadow min-h-[200px] ${snapshot.isDraggingOver ? 'bg-gray-700' : ''}`}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{estado === 'pendiente' ? 'Pendientes' : 'Completadas'}</h3>
                      {tareas.filter(t => t.estado === estado).map((tarea, index) => (
                        <Draggable key={tarea._id} draggableId={tarea._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 rounded mb-2 shadow text-white ${colorCategoria(tarea.categoria)}`}
                            >
                              <h4 className="font-bold">{tarea.titulo}</h4>
                              <p className="text-sm">{tarea.descripcion}</p>
                              {tarea.asignadoA && <p className="text-xs flex items-center gap-1"><FaUser /> {tarea.asignadoA}</p>}
                              <p className="text-xs">📅 {tarea.fecha} ⏰ {tarea.hora}</p>
                              {tarea.categoria && <p className="text-xs"><FaTag /> {tarea.categoria}</p>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* === PESTAÑA: CALENDARIO === */}
      {activeTab === 'calendario' && (
        <div style={{ height: '70vh', marginTop: '1rem' }}>
          <BigCalendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', color: 'white' }}
            views={['month', 'week', 'day']}
            step={30}
            timeslots={2}
            onSelectEvent={(event) => {
              setTareaSeleccionada(event.resource);
            }}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día'
            }}
            eventPropGetter={(event) => {
              const bgColor = colorCategoria(event.resource.categoria);
              return {
                style: { backgroundColor: bgColor.replace('bg-', '').replace('-', ' '), borderRadius: '6px' }
              };
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tareas;
