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
  FaTimes,
  FaEllipsisV,
  FaUser
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
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
  const [subtareasInput, setSubtareasInput] = useState('');
  const [subtareas, setSubtareas] = useState([]);
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
  const [asignadoAFiltro, setAsignadoAFiltro] = useState(''); // Nuevo estado para filtro de asignación
  const [asignadoA, setAsignadoA] = useState(''); // Estado para asignación en formulario

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

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
          setTareas(data);
          const categorias = [...new Set(data.map(t => t.categoria).filter(Boolean))];
          setCategoriasExistentes(categorias);
        }
      } catch (error) {
        console.error('Error al obtener tareas:', error);
      }
    };
    obtenerTareas();
  }, []);

  const onDragEnd = async (result) => {
    // Corrección: Agregar await y manejo de errores
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Si no hay cambio real, no hacer nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const items = Array.from(tareas);
    const [movedItem] = items.splice(source.index, 1);
    
    // Actualizar estado local inmediatamente para una mejor UX
    const updatedItem = { ...movedItem, estado: destination.droppableId };
    items.splice(destination.index, 0, updatedItem);
    setTareas(items);

    // Actualizar en el backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/tasks/${movedItem._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: destination.droppableId }),
      });

      if (!response.ok) {
        // Si falla, revertir el cambio local
        const originalItems = Array.from(tareas);
        setTareas(originalItems);
        console.error('Error al actualizar el estado de la tarea');
      }
    } catch (error) {
      // Si hay error de red, revertir el cambio local
      const originalItems = Array.from(tareas);
      setTareas(originalItems);
      console.error('Error de red al actualizar la tarea:', error);
    }
  };

  const tareasPorEstado = (estado) => tareas.filter(t => t.estado === estado);

  const colorCategoria = (cat) => coloresPorCategoria[cat?.toLowerCase()] || 'bg-gray-600';

  const filtrarTareas = () => {
    let filtradas = [...tareas];
    if (categoriaFiltro) filtradas = filtradas.filter(t => t.categoria === categoriaFiltro);
    if (estadoFiltro) filtradas = filtradas.filter(t => t.estado === estadoFiltro);
    if (asignadoAFiltro) filtradas = filtradas.filter(t => t.asignadoA && t.asignadoA.toLowerCase().includes(asignadoAFiltro.toLowerCase())); // Filtro por asignación
    if (fechaInicio && !fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha).toISOString().split('T')[0] === fechaInicio);
    if (fechaInicio && fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha) >= new Date(fechaInicio) && new Date(t.fecha) <= new Date(fechaFin));
    return filtradas.sort((a, b) => a.estado !== b.estado ? (a.estado === 'pendiente' ? -1 : 1) : new Date(a.fecha) - new Date(b.fecha));
  };

  const tareasFiltradas = filtrarTareas();

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setFecha('');
    setHora('');
    setCategoria('');
    setNota('');
    setEnlace('');
    setSubtareas([]);
    setArchivo(null);
    setAsignadoA(''); // Limpiar asignación
    setError('');
    setExito('');
    setModoEdicion(null);
  };

  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setEstadoFiltro('');
    setFechaInicio('');
    setFechaFin('');
    setAsignadoAFiltro(''); // Limpiar filtro de asignación
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
    formData.append('asignadoA', asignadoA); // Agregar asignación
    formData.append('estado', 'pendiente');
    formData.append('subtareas', JSON.stringify(subtareas));
    if (archivo) formData.append('archivo', archivo);

    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => [...prev, data]);
        setExito('✅ Tarea agregada exitosamente.');
        limpiarFormulario();
        setTimeout(() => setExito(''), 3000);
        if (!categoriasExistentes.includes(data.categoria)) {
          setCategoriasExistentes(prev => [...prev, data.categoria]);
        }
      } else {
        console.error('Error al crear tarea:', data);
        setError(data?.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error de red al crear tarea:', error);
    }
  };

  const guardarEdicion = async () => {
    if (!modoEdicion) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tasks/${modoEdicion}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, nota, enlace, asignadoA, subtareas }), // Incluir asignación
      });
      const data = await res.json();
      if (res.ok) {
        setTareas(prev => prev.map(t => (t._id === modoEdicion ? { ...t, ...data } : t)));
        setExito('✅ Tarea actualizada correctamente.');
        limpiarFormulario();
        setTimeout(() => setExito(''), 3000);
      } else {
        console.error('Error al editar tarea:', data);
        setError(data?.error || 'Error al editar');
      }
    } catch (error) {
      console.error('Error de red al editar tarea:', error);
    }
  };

  // Obtener lista única de personas asignadas para el filtro
  const personasAsignadas = [...new Set(tareas.map(t => t.asignadoA).filter(Boolean))];

  return (
    <DashboardLayout>
      {exito && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{exito}</div>}
      {error && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{error}</div>}

      <div className="text-white p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todas las categorías</option>
            {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
          </select>
          <select value={asignadoAFiltro} onChange={e => setAsignadoAFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todas las asignaciones</option>
            {personasAsignadas.map(persona => <option key={persona} value={persona}>{persona}</option>)}
          </select>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input bg-gray-800 text-white" />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input bg-gray-800 text-white" />
        </div>
        <button onClick={limpiarFiltros} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mb-4">Limpiar filtros</button>
        
        {/* Formulario */}
        <div className="bg-gray-900 p-4 rounded mb-8">
          <h2 className="text-xl font-bold mb-4">{modoEdicion ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <input className="input w-full mb-2 bg-gray-800 text-white" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <input className="input w-full mb-2 bg-gray-800 text-white" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <input type="date" className="input bg-gray-800 text-white" value={fecha} onChange={e => setFecha(e.target.value)} />
            <input type="time" className="input bg-gray-800 text-white" value={hora} onChange={e => setHora(e.target.value)} />
            <input className="input bg-gray-800 text-white" placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} />
            <input className="input bg-gray-800 text-white" placeholder="Enlace relacionado" value={enlace} onChange={e => setEnlace(e.target.value)} />
          </div>
          <input className="input w-full mb-2 bg-gray-800 text-white" placeholder="Asignar a (nombre o email)" value={asignadoA} onChange={e => setAsignadoA(e.target.value)} /> {/* Campo de asignación */}
          <textarea className="input w-full mb-2 bg-gray-800 text-white" placeholder="Nota larga" value={nota} onChange={e => setNota(e.target.value)} />
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
              <div className="text-sm flex flex-wrap gap-2 mt-2">
                {t.fecha && <span className="bg-gray-700 px-2 py-0.5 rounded">📅 {t.fecha}</span>}
                {t.hora && <span className="bg-gray-700 px-2 py-0.5 rounded">⏰ {t.hora}</span>}
                {t.categoria && <span className="bg-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><FaTag /> {t.categoria}</span>}
                {t.asignadoA && <span className="bg-indigo-700 px-2 py-0.5 rounded flex items-center gap-1"><FaUser /> {t.asignadoA}</span>} {/* Mostrar asignación */}
                {t.nota && <span className="bg-purple-700 px-2 py-0.5 rounded">📝 Nota</span>}
                {t.enlace && <a href={t.enlace} target="_blank" rel="noopener noreferrer" className="bg-cyan-700 px-2 py-0.5 rounded flex items-center gap-1"><FaExternalLinkAlt /> Enlace</a>}
                {t.archivoUrl && <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer" className="bg-teal-700 px-2 py-0.5 rounded flex items-center gap-1"><FaPaperclip /> Archivo</a>}
              </div>
              {/* Acciones al pie */}
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => {
                  setModoEdicion(t._id);
                  setTitulo(t.titulo);
                  setDescripcion(t.descripcion);
                  setFecha(t.fecha);
                  setHora(t.hora);
                  setCategoria(t.categoria);
                  setNota(t.nota);
                  setEnlace(t.enlace);
                  setAsignadoA(t.asignadoA || ''); // Cargar asignación
                  setSubtareas(t.subtareas || []);
                }} className="text-yellow-400 hover:text-yellow-200">
                  ✏️ Editar
                </button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const nuevoEstado = t.estado === 'pendiente' ? 'completada' : 'pendiente';
                    const res = await fetch(`${API}/api/tasks/${t._id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({ estado: nuevoEstado }),
                    });
                    if (res.ok) {
                      setTareas(prev => prev.map(task => task._id === t._id ? { ...task, estado: nuevoEstado } : task));
                    }
                  }}
                  className="text-green-400 hover:text-green-200"
                >
                  {t.estado === 'pendiente' ? '✅ Marcar como completada' : '⏳ Marcar como pendiente'}
                </button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API}/api/tasks/${t._id}`, {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${token}`
                      },
                    });
                    if (res.ok) {
                      setTareas(prev => prev.filter(task => task._id !== t._id));
                    }
                  }}
                  className="text-red-500 hover:text-red-300"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Vista Kanban con drag & drop */}
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Vista Kanban</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['pendiente', 'en progreso', 'completada'].map((estado) => (
              <Droppable droppableId={estado} key={estado}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    className={`bg-gray-800 rounded-lg p-4 shadow min-h-[200px] ${snapshot.isDraggingOver ? 'bg-gray-700' : ''}`}
                  >
                    <h3 className="text-lg font-semibold capitalize text-white mb-2">{estado}</h3>
                    {tareasPorEstado(estado).map((tarea, index) => (
                      <Draggable draggableId={tarea._id} index={index} key={tarea._id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded mb-2 shadow text-white ${colorCategoria(tarea.categoria)} ${snapshot.isDragging ? 'opacity-90' : ''}`}
                          >
                            <h4 className="font-bold">{tarea.titulo}</h4>
                            <p className="text-sm text-white/90">{tarea.descripcion}</p>
                            {tarea.asignadoA && ( // Mostrar asignación en Kanban
                              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                                <FaUser className="text-xs" /> {tarea.asignadoA}
                              </p>
                            )}
                            <p className="text-xs text-white/70">📅 {tarea.fecha} 🕒 {tarea.hora}</p>
                            {tarea.categoria && <p className="text-xs mt-1 flex items-center gap-1"><FaTag /> {tarea.categoria}</p>}
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
    </DashboardLayout>
  );
};

export default Tareas;
