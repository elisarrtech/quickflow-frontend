// ✅ TAREAS.JSX CON CHECKLIST DINÁMICO, NOTAS, ENLACES Y EDICIÓN (MEJORADO CON EDICIÓN Y ELIMINACIÓN DE SUBTAREAS)

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaArrowLeft, FaPlus, FaTag, FaExternalLinkAlt, FaPaperclip, FaCheckSquare, FaRegSquare, FaTimes } from 'react-icons/fa';
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
  const [enlace, setEnlace] = useState('');
  const [nota, setNota] = useState('');
  const [modoEdicion, setModoEdicion] = useState(null);
  const [editData, setEditData] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', categoria: '', nota: '', enlace: '', subtareas: [] });
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
          const ordenadas = data.sort((a, b) => a.estado !== b.estado ? (a.estado === 'pendiente' ? -1 : 1) : new Date(a.fecha) - new Date(b.fecha));
          setTareas(ordenadas);
        }
      } catch {}
    };
    obtenerTareas();
  }, []);

  const crearTarea = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('categoria', categoria);
    formData.append('nota', nota);
    formData.append('enlace', enlace);
    formData.append('subtareas', JSON.stringify(subtareas));
    if (archivo) formData.append('archivo', archivo);
    const res = await fetch(`${API}/api/tasks`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (res.ok) setTareas(prev => [...prev, data]);
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setTareas(prev => prev.filter(t => t._id !== id));
  };

  const toggleEstado = async (t) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${t._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, estado: t.estado === 'pendiente' ? 'completada' : 'pendiente' })
    });
    if (res.ok) setTareas(prev => prev.map(x => x._id === t._id ? { ...x, estado: x.estado === 'pendiente' ? 'completada' : 'pendiente' } : x));
  };

  const toggleSubtarea = (id, i) => {
    setTareas(prev => prev.map(t => {
      if (t._id === id) {
        const s = [...t.subtareas];
        s[i].completado = !s[i].completado;
        return { ...t, subtareas: s };
      }
      return t;
    }));
  };

  const eliminarSubtarea = (index) => {
    setSubtareas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="text-white p-4 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-sm mb-4 flex items-center text-white"><FaArrowLeft className="mr-2" /> Volver</button>

      <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="text" placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="url" placeholder="Enlace web" value={enlace} onChange={e => setEnlace(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <textarea placeholder="Nota larga" value={nota} onChange={e => setNota(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />

      <div className="bg-gray-900 p-3 rounded mb-2">
        <div className="flex gap-2 mb-2">
          <input type="text" value={subtareasInput} onChange={(e) => setSubtareasInput(e.target.value)} placeholder="Subtarea (ej. Subir diseño)" className="w-full p-2 rounded bg-gray-700 text-white" />
          <button onClick={() => { if (subtareasInput.trim()) { setSubtareas([...subtareas, { texto: subtareasInput, completado: false }]); setSubtareasInput(''); } }} className="bg-blue-600 px-3 rounded text-white"><FaPlus /></button>
        </div>
        {subtareas.map((s, i) => (
          <div key={i} className="text-sm text-white flex items-center justify-between">
            <div className="flex items-center">
              <FaRegSquare className="mr-2" /> {s.texto}
            </div>
            <button onClick={() => eliminarSubtarea(i)} className="text-red-400"><FaTimes /></button>
          </div>
        ))}
      </div>

      <input type="file" accept=".pdf,image/*" onChange={(e) => setArchivo(e.target.files[0])} className="w-full p-2 bg-gray-800 text-white rounded" />
      <button onClick={crearTarea} className="w-full bg-blue-600 p-2 mt-2 rounded text-white">Crear tarea</button>

      {/* Aquí continúa el resto del componente como ya lo tienes... */}
    </div>
  );
};

export default Tareas;
