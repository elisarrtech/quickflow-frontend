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
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categoriasExistentes, setCategoriasExistentes] = useState([]);
  const [asignadoAFiltro, setAsignadoAFiltro] = useState('');

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => { Notification.requestPermission(); }, []);

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
      const response = await fetch(`${API}/api/tasks/${movedItem._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: destination.droppableId }),
      });
      if (!response.ok) {
        const originalItems = Array.from(tareas);
        setTareas(originalItems);
        console.error('Error al actualizar el estado de la tarea');
      }
    } catch (error) {
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
    if (asignadoAFiltro) filtradas = filtradas.filter(t => t.asignadoA && t.asignadoA.toLowerCase().includes(asignadoAFiltro.toLowerCase()));
    if (fechaInicio && !fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha).toISOString().split('T')[0] === fechaInicio);
    if (fechaInicio && fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha) >= new Date(fechaInicio) && new Date(t.fecha) <= new Date(fechaFin));
    return filtradas;
  };

  const tareasFiltradas = filtrarTareas();
  const personasAsignadas = [...new Set(tareas.map(t => t.asignadoA).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todas las categorías</option>
            {categoriasExistentes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
          <select value={asignadoAFiltro} onChange={e => setAsignadoAFiltro(e.target.value)} className="input bg-gray-800 text-white">
            <option value="">Todas las asignaciones</option>
            {personasAsignadas.map(persona => <option key={persona} value={persona}>{persona}</option>)}
          </select>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input bg-gray-800 text-white" />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input bg-gray-800 text-white" />
        </div>
        <button onClick={() => { setCategoriaFiltro(''); setEstadoFiltro(''); setFechaInicio(''); setFechaFin(''); setAsignadoAFiltro(''); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mb-4">Limpiar filtros</button>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Vista Kanban</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['pendiente', 'en progreso', 'completada'].map((estado) => (
              <Droppable droppableId={estado} key={estado}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`bg-gray-800 rounded-lg p-4 shadow min-h-[200px] ${snapshot.isDraggingOver ? 'bg-gray-700' : ''}`}>
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
                            {tarea.asignadoA && (
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
