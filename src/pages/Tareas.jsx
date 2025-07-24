// ✅ TAREAS.JSX CON CHECKLIST DINÁMICO, NOTAS, ENLACES Y EDICIÓN

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaArrowLeft, FaPlus, FaTag, FaExternalLinkAlt, FaPaperclip, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
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
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [fechaFiltro, setFechaFiltro] = useState('');
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

  const editarTarea = (t) => {
    setModoEdicion(t._id);
    setEditData({
      titulo: t.titulo,
      descripcion: t.descripcion,
      fecha: t.fecha,
      hora: t.hora,
      categoria: t.categoria,
      nota: t.nota || '',
      enlace: t.enlace || '',
      subtareas: t.subtareas || [],
    });
  };

  const guardarCambios = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${modoEdicion}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setTareas(prev => prev.map(t => t._id === modoEdicion ? { ...t, ...editData } : t));
      setModoEdicion(null);
    }
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

  return (
    <div className="text-white p-4 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-sm mb-4 flex items-center text-white"><FaArrowLeft className="mr-2" /> Volver</button>

      {/* FORMULARIO CREAR */}
      <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="text" placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="url" placeholder="Enlace web" value={enlace} onChange={e => setEnlace(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <textarea placeholder="Nota larga" value={nota} onChange={e => setNota(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
      <input type="file" accept=".pdf,image/*" onChange={(e) => setArchivo(e.target.files[0])} className="w-full p-2 bg-gray-800 text-white rounded" />
      <button onClick={crearTarea} className="w-full bg-blue-600 p-2 mt-2 rounded text-white">Crear tarea</button>

      {/* FORMULARIO EDICIÓN */}
      {modoEdicion && (
        <div className="mt-4 p-4 bg-gray-900 rounded">
          <input type="text" value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <textarea value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <input type="date" value={editData.fecha} onChange={e => setEditData({ ...editData, fecha: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <input type="time" value={editData.hora} onChange={e => setEditData({ ...editData, hora: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <input type="text" value={editData.categoria} onChange={e => setEditData({ ...editData, categoria: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <textarea value={editData.nota} onChange={e => setEditData({ ...editData, nota: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <input type="url" value={editData.enlace} onChange={e => setEditData({ ...editData, enlace: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mb-2" />
          <div className="flex gap-2">
            <button onClick={guardarCambios} className="bg-green-600 text-white p-2 rounded">Guardar</button>
            <button onClick={() => setModoEdicion(null)} className="bg-gray-600 text-white p-2 rounded">Cancelar</button>
          </div>
        </div>
      )}

      {/* LISTADO */}
      <div className="mt-6 space-y-4">
        {tareas.map((t) => (
          <div key={t._id} className="bg-gray-800 p-4 rounded shadow">
            <h3 className="text-lg font-bold">{t.titulo}</h3>
            <p>{t.descripcion}</p>
            {t.nota && <p className="bg-gray-700 p-2 rounded mt-2 text-sm">📝 {t.nota}</p>}
            {t.enlace && <a href={t.enlace} className="text-blue-400 inline-flex items-center"><FaExternalLinkAlt className="mr-1" /> Enlace</a>}
            <p className="text-xs">📅 {t.fecha} 🕒 {t.hora}</p>
            {t.categoria && <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-600 rounded"><FaTag className="inline mr-1" />{t.categoria}</span>}
            {t.subtareas?.map((s, i) => (
              <div key={i} className="flex items-center text-sm mt-1">
                <button onClick={() => toggleSubtarea(t._id, i)} className="mr-2">{s.completado ? <FaCheckSquare /> : <FaRegSquare />}</button>
                <span className={s.completado ? 'line-through text-gray-400' : ''}>{s.texto}</span>
              </div>
            ))}
            {t.archivo && <a href={`${API}/${t.archivo}`} className="text-blue-400 inline-flex items-center"><FaPaperclip className="mr-1" /> Ver archivo</a>}
            <p className={`text-xs mt-1 ${t.estado === 'pendiente' ? 'text-yellow-400' : 'text-green-400'}`}>{t.estado}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => toggleEstado(t)} className="text-blue-400"><FaCheckCircle /></button>
              <button onClick={() => editarTarea(t)} className="text-yellow-400"><FaEdit /></button>
              <button onClick={() => eliminarTarea(t._id)} className="text-red-500"><FaTrashAlt /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tareas;
