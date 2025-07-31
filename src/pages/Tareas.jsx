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
  FaTimes,
  FaEllipsisV,
  FaUser,
  FaShareAlt,
  FaEnvelope,
  FaWhatsapp,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaGripLines
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const coloresPorCategoria = {
  trabajo: 'bg-blue-600',
  personal: 'bg-green-600',
  urgente: 'bg-red-600',
  estudio: 'bg-purple-600',
  otros: 'bg-gray-600'
};

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subtareas, setSubtareas] = useState([]); // [{ texto, completada }]
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
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [categoriasExistentes, setCategoriasExistentes] = useState([]);
  const [asignadoAFiltro, setAsignadoAFiltro] = useState('');
  const [asignadoA, setAsignadoA] = useState('');
  const [compartirMenuAbierto, setCompartirMenuAbierto] = useState(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null); // Para el modal
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Solicitar permiso para notificaciones
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // Cargar tareas desde el backend
  useEffect(() => {
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
        console.log('✅ Tareas cargadas:', data);
        const tareasArray = Array.isArray(data) ? data : data.tareas || [];
        // Asegurar que subtareas sea un array de objetos {texto, completada}
        const tareasConSubtareas = tareasArray.map(t => ({
          ...t,
          subtareas: Array.isArray(t.subtareas)
            ? t.subtareas.map(s => typeof s === 'string' ? { texto: s, completada: false } : s)
            : []
        }));
        setTareas(tareasConSubtareas);
        const categorias = [...new Set(tareasConSubtareas.map(t => t.categoria).filter(Boolean))];
        setCategoriasExistentes(categorias);
      } catch (error) {
        console.error('🔴 Error de red al obtener tareas:', error);
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
    };
    obtenerTareas();
  }, [API, navigate]);

  // Manejar drag & drop (kanban)
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
      if (!res.ok) {
        setTareas(tareas);
        console.error('Error al actualizar estado en el backend');
      }
    } catch (error) {
      setTareas(tareas);
      console.error('Error de red al actualizar tarea:', error);
    }
  };

  // Drag & drop para subtareas
  const onDragEndSubtareas = (result, tareaId) => {
    if (!result.destination) return;
    const tarea = tareas.find(t => t._id === tareaId);
    if (!tarea) return;
    const newSubtareas = Array.from(tarea.subtareas);
    const [reordered] = newSubtareas.splice(result.source.index, 1);
    newSubtareas.splice(result.destination.index, 0, reordered);
    const updatedTarea = { ...tarea, subtareas: newSubtareas };
    setTareas(prev => prev.map(t => (t._id === tareaId ? updatedTarea : t)));
    setSubtareas(newSubtareas); // Si estamos editando
    setTareaSeleccionada(prev => prev?._id === tareaId ? updatedTarea : prev);
  };

  // Filtrar tareas
  const filtrarTareas = () => {
    let filtradas = [...tareas];
    if (categoriaFiltro) filtradas = filtradas.filter(t => t.categoria === categoriaFiltro);
    if (estadoFiltro) filtradas = filtradas.filter(t => t.estado === estadoFiltro);
    if (asignadoAFiltro) filtradas = filtradas.filter(t => t.asignadoA?.toLowerCase().includes(asignadoAFiltro.toLowerCase()));
    if (fechaInicio && !fechaFin) filtradas = filtradas.filter(t => t.fecha === fechaInicio);
    if (fechaInicio && fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha) >= new Date(fechaInicio) && new Date(t.fecha) <= new Date(fechaFin));
    return filtradas.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
      return new Date(a.fecha) - new Date(b.fecha);
    });
  };

  const tareasFiltradas = filtrarTareas();
  const personasAsignadas = [...new Set(tareas.map(t => t.asignadoA).filter(Boolean))];
  const colorCategoria = (cat) => coloresPorCategoria[cat?.toLowerCase()] || 'bg-gray-600';

  // Limpiar formulario
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
  };

  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setEstadoFiltro('');
    setFechaInicio('');
    setFechaFin('');
    setAsignadoAFiltro('');
  };

  // Crear nueva tarea
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
          subtareas: data.subtareas?.map(s => typeof s === 'string' ? { texto: s, completada: false } : s) || []
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

  // Editar tarea
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
        body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, nota, enlace, asignadoA, subtareas })
      });
      const data = await res.json();
      if (res.ok) {
        const tareaActualizada = {
          ...data,
          subtareas: data.subtareas?.map(s => typeof s === 'string' ? { texto: s, completada: false } : s) || []
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

  // Compartir por correo
  const compartirPorCorreo = (tarea) => {
    const asunto = encodeURIComponent(`Tarea: ${tarea.titulo}`);
    const cuerpo = encodeURIComponent(
      `Hola,
` +
      `Título: ${tarea.titulo}
` +
      `Descripción: ${tarea.descripcion || 'Sin descripción'}
` +
      `Fecha: ${tarea.fecha || 'Sin fecha'}
` +
      `Hora: ${tarea.hora || 'Sin hora'}
` +
      `Categoría: ${tarea.categoria || 'Sin categoría'}
` +
      `Asignado a: ${tarea.asignadoA || 'No asignado'}
` +
      `${tarea.enlace ? `
Enlace: ${tarea.enlace}` : ''}` +
      `${tarea.nota ? `
Nota: ${tarea.nota}` : ''}` +
      (tarea.subtareas?.length > 0
        ? `
Subtareas:
${tarea.subtareas.map(s => `- [${s.completada ? 'x' : ' '}] ${s.texto}`).join('\n')}`
        : '')
    );
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  };

  // Compartir por WhatsApp
  const compartirPorWhatsApp = (tarea) => {
    const texto = encodeURIComponent(
      `*Tarea: ${tarea.titulo}*
` +
      `Descripción: ${tarea.descripcion || 'Sin descripción'}
` +
      `Fecha: ${tarea.fecha || 'Sin fecha'}
` +
      `Hora: ${tarea.hora || 'Sin hora'}
` +
      `Categoría: ${tarea.categoria || 'Sin categoría'}
` +
      `Asignado a: ${tarea.asignadoA || 'No asignado'}
` +
      `${tarea.enlace ? `
🔗 Enlace: ${tarea.enlace}` : ''}` +
      `${tarea.nota ? `
📝 Nota: ${tarea.nota}` : ''}` +
      (tarea.subtareas?.length > 0
        ? `
✅ Subtareas:
${tarea.subtareas.map(s => `• ${s.completada ? '✔️' : '☐'} ${s.texto}`).join('\n')}`
        : '')
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  return (
    <div className="text-white p-6 max-w-5xl mx-auto">
      {/* Mensajes */}
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

      {/* Filtros */}
      <h2 className="text-xl font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="input bg-gray-800 text-white">
          <option value="">Todas</option>
          {categoriasExistentes.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="input bg-gray-800 text-white">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
        </select>
        <select value={asignadoAFiltro} onChange={e => setAsignadoAFiltro(e.target.value)} className="input bg-gray-800 text-white">
          <option value="">Todos</option>
          {personasAsignadas.map(persona => (
            <option key={persona} value={persona}>{persona}</option>
          ))}
        </select>
        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input bg-gray-800 text-white" />
        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input bg-gray-800 text-white" />
      </div>
      <button onClick={limpiarFiltros} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mb-4">Limpiar filtros</button>

      {/* Formulario */}
      <div className="bg-gray-900 p-4 rounded mb-8">
        <h2 className="text-xl font-bold mb-4">{modoEdicion ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
        <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white" />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input bg-gray-800 text-white" />
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="input bg-gray-800 text-white" />
          <input placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="input bg-gray-800 text-white" />
          <input placeholder="Enlace" value={enlace} onChange={e => setEnlace(e.target.value)} className="input bg-gray-800 text-white" />
        </div>
        <input placeholder="Asignar a" value={asignadoA} onChange={e => setAsignadoA(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white" />
        <textarea placeholder="Nota" value={nota} onChange={e => setNota(e.target.value)} className="input w-full mb-2 bg-gray-800 text-white" />

        {/* Formulario de subtareas con checkbox y edición */}
        <div className="mb-2">
          <label className="block text-sm font-semibold mb-1">Subtareas</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Escribe una subtarea"
              value={nuevaSubtarea}
              onChange={e => setNuevaSubtarea(e.target.value)}
              className="input flex-1 bg-gray-800 text-white"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
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
                                }}
                                className="text-green-500"
                              />
                              <span className={s.completada ? 'line-through text-gray-400' : ''}>
                                {s.texto}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSubtareas(subtareas.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700 text-xs ml-2"
                            >
                              Eliminar
                            </button>
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

        <input type="file" onChange={e => setArchivo(e.target.files[0])} className="input w-full mb-2 bg-gray-800 text-white" />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={modoEdicion ? guardarEdicion : crearTarea}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {modoEdicion ? 'Guardar cambios' : 'Crear tarea'}
        </button>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-4 mt-6">
        {tareasFiltradas.map(t => (
          <div key={t._id} className={`p-4 rounded border ${t.estado === 'completada' ? 'border-green-600 bg-green-900/20' : 'border-yellow-500 bg-yellow-900/10'}`}>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {t.estado === 'completada' ? <FaCheckCircle className="text-green-400" /> : <FaRegSquare className="text-yellow-300" />} {t.titulo}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{t.descripcion}</p>

            {/* Etiquetas */}
            <div className="flex flex-wrap gap-2 mt-2">
              {t.fecha && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-purple-600">
                  <FaCalendarAlt className="inline mr-1" /> {t.fecha}
                </span>
              )}
              {t.hora && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-pink-500">
                  <FaClock className="inline mr-1" /> {t.hora}
                </span>
              )}
              {t.categoria && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-blue-600">
                  <FaTag className="inline mr-1" /> {t.categoria?.toUpperCase()}
                </span>
              )}
              {t.asignadoA && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-gray-600">
                  <FaUser className="inline mr-1" /> {t.asignadoA}
                </span>
              )}
              {t.nota && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-fuchsia-600">
                  <FaStickyNote className="inline mr-1" /> Nota
                </span>
              )}
              {t.enlace && (
                <a href={t.enlace} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded text-white text-sm font-semibold bg-indigo-600">
                  <FaExternalLinkAlt className="inline mr-1" /> Enlace
                </a>
              )}
              {t.archivoUrl && (
                <span className="px-2 py-1 rounded text-white text-sm font-semibold bg-emerald-600">
                  <FaPaperclip className="inline mr-1" /> Archivo
                </span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-4">
              <div className="relative">
                <button
                  onClick={() => setCompartirMenuAbierto(compartirMenuAbierto === t._id ? null : t._id)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <FaShareAlt />
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
                }}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <FaEdit /> Editar
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
                  if (res.ok) {
                    setTareas(prev => prev.map(task => (task._id === t._id ? { ...task, estado: nuevoEstado } : task)));
                  }
                }}
                className="text-green-500 hover:text-green-600"
              >
                <FaCheckCircle /> {t.estado === 'pendiente' ? 'Completar' : 'Pendiente'}
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${API}/api/tasks/${t._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                  if (res.ok) setTareas(prev => prev.filter(task => task._id !== t._id));
                }}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrashAlt /> Eliminar
              </button>
              {/* Botón "Ver más" */}
              <button
                onClick={() => setTareaSeleccionada(t)}
                className="text-sm text-cyan-400 hover:text-cyan-600 mt-3 underline"
              >
                Ver más
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Kanban */}
      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Vista Kanban</h2>
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

      {/* Modal de detalle de tarea */}
      {tareaSeleccionada && (
        <DragDropContext onDragEnd={(result) => onDragEndSubtareas(result, tareaSeleccionada._id)}>
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-lg w-full text-white relative">
              <button
                onClick={() => setTareaSeleccionada(null)}
                className="absolute top-2 right-3 text-white text-xl hover:text-red-400"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold mb-2">{tareaSeleccionada.titulo}</h2>
              <p className="mb-2 text-gray-300">{tareaSeleccionada.descripcion}</p>

              {tareaSeleccionada.nota && (
                <div className="mb-2">
                  <p className="font-semibold">📝 Nota:</p>
                  <p className="whitespace-pre-line">{tareaSeleccionada.nota}</p>
                </div>
              )}

              {tareaSeleccionada.enlace && (
                <div className="mb-2">
                  <p className="font-semibold">🔗 Enlace:</p>
                  <a
                    href={tareaSeleccionada.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {tareaSeleccionada.enlace}
                  </a>
                </div>
              )}

              {tareaSeleccionada.archivoUrl && (
                <div className="mb-2">
                  <p className="font-semibold">📎 Archivo:</p>
                  <a
                    href={tareaSeleccionada.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 underline"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}

              {/* Subtareas en el modal con checkbox y drag */}
              {tareaSeleccionada.subtareas?.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold mb-1">✅ Subtareas:</p>
                  <Droppable droppableId="subtareas-modal">
                    {(provided) => (
                      <ul ref={provided.innerRef} {...provided.droppableProps} className="list-none space-y-1">
                        {tareaSeleccionada.subtareas.map((sub, idx) => (
                          <Draggable key={`modal-${idx}`} draggableId={`modal-${idx}`} index={idx}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 p-1 border-b border-gray-700 last:border-b-0"
                              >
                                <FaGripLines className="text-gray-500 cursor-move" />
                                <input
                                  type="checkbox"
                                  checked={sub.completada}
                                  onChange={() => {
                                    const updated = [...tareaSeleccionada.subtareas];
                                    updated[idx] = { ...sub, completada: !sub.completada };
                                    setTareaSeleccionada({ ...tareaSeleccionada, subtareas: updated });
                                  }}
                                  className="text-green-500"
                                />
                                <span className={sub.completada ? 'line-through text-gray-400' : ''}>
                                  {sub.texto}
                                </span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>
              )}

              <div className="text-sm mt-4 text-gray-400">
                <p><strong>Fecha:</strong> {tareaSeleccionada.fecha}</p>
                <p><strong>Hora:</strong> {tareaSeleccionada.hora}</p>
                <p><strong>Categoría:</strong> {tareaSeleccionada.categoria}</p>
                <p><strong>Asignado a:</strong> {tareaSeleccionada.asignadoA || 'No asignado'}</p>
              </div>
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Tareas;
