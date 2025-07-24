// src/pages/Tareas.jsx
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaPlus, FaTag, FaExternalLinkAlt, FaPaperclip, FaCheckSquare, FaRegSquare, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

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
    if (!titulo.trim()) return setError('El título es obligatorio');
    if (tareas.some(t => t.titulo.toLowerCase() === titulo.trim().toLowerCase())) return setError('Ya existe una tarea con ese título');

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
    if (res.ok) {
      setTareas(prev => [...prev, data]);
      limpiarFormulario();
    }
  };

  const limpiarFormulario = () => {
    setTitulo(''); setDescripcion(''); setFecha(''); setHora(''); setCategoria(''); setNota(''); setEnlace(''); setSubtareas([]); setArchivo(null); setError('');
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setTareas(prev => prev.filter(t => t._id !== id));
  };

  const editarTarea = (t) => {
    setModoEdicion(t._id);
    setTitulo(t.titulo);
    setDescripcion(t.descripcion);
    setFecha(t.fecha);
    setHora(t.hora);
    setCategoria(t.categoria);
    setNota(t.nota || '');
    setEnlace(t.enlace || '');
    setSubtareas(t.subtareas || []);
    setArchivo(null);
    setError('');
  };

  const actualizarTarea = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${modoEdicion}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, fecha, hora, categoria, nota, enlace, subtareas })
    });
    const data = await res.json();
    if (res.ok) {
      setTareas(prev => prev.map(t => t._id === modoEdicion ? data : t));
      setModoEdicion(null);
      limpiarFormulario();
    }
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
    <DashboardLayout>
      <div className="text-white p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Tareas</h2>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Título" className="input" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <input type="text" placeholder="Descripción" className="input" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <input type="date" className="input" value={fecha} onChange={e => setFecha(e.target.value)} />
          <input type="time" className="input" value={hora} onChange={e => setHora(e.target.value)} />
          <input type="text" placeholder="Categoría" className="input" value={categoria} onChange={e => setCategoria(e.target.value)} />
          <input type="text" placeholder="Enlace" className="input" value={enlace} onChange={e => setEnlace(e.target.value)} />
          <textarea placeholder="Nota larga..." className="input" value={nota} onChange={e => setNota(e.target.value)} />
          <input type="file" className="input" onChange={e => setArchivo(e.target.files[0])} />
          <div className="col-span-2">
            <div className="flex gap-2 mb-2">
              <input type="text" className="input flex-1" placeholder="Subtarea" value={subtareasInput} onChange={e => setSubtareasInput(e.target.value)} />
              <button className="btn" onClick={() => {
                if (subtareasInput.trim()) {
                  setSubtareas([...subtareas, { texto: subtareasInput, completado: false }]);
                  setSubtareasInput('');
                }
              }}><FaPlus /></button>
            </div>
            {subtareas.map((s, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span onClick={() => setSubtareas(prev => {
                  const nuevo = [...prev];
                  nuevo[i].completado = !nuevo[i].completado;
                  return nuevo;
                })}>{s.completado ? <FaCheckSquare /> : <FaRegSquare />}</span>
                <span className={s.completado ? 'line-through' : ''}>{s.texto}</span>
                <FaTimes className="cursor-pointer" onClick={() => eliminarSubtarea(i)} />
              </div>
            ))}
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            {modoEdicion ? (
              <>
                <button className="btn" onClick={actualizarTarea}>Actualizar</button>
                <button className="btn" onClick={limpiarFormulario}>Cancelar</button>
              </>
            ) : (
              <button className="btn" onClick={crearTarea}>Crear</button>
            )}
          </div>
          {error && <p className="text-red-400 col-span-2">{error}</p>}
        </div>

        <div className="space-y-4">
          {tareas.map(t => (
            <div key={t._id} className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{t.titulo}</h3>
                <div className="flex gap-2">
                  <FaCheckCircle onClick={() => toggleEstado(t)} className={`cursor-pointer ${t.estado === 'completada' ? 'text-green-400' : 'text-yellow-400'}`} />
                  <FaEdit className="cursor-pointer text-blue-400" onClick={() => editarTarea(t)} />
                  <FaTrashAlt className="cursor-pointer text-red-400" onClick={() => eliminarTarea(t._id)} />
                </div>
              </div>
              <p className="text-sm text-gray-400">{t.descripcion}</p>
              {t.fecha && <p className="text-xs">📅 {t.fecha} ⏰ {t.hora}</p>}
              {t.categoria && <p className="text-xs flex items-center gap-1"><FaTag /> {t.categoria}</p>}
              {t.enlace && <p className="text-xs flex items-center gap-1"><FaExternalLinkAlt /><a href={t.enlace} target="_blank" rel="noopener noreferrer">Enlace</a></p>}
              {t.nota && <p className="text-sm mt-2">📝 {t.nota}</p>}
              {t.subtareas?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {t.subtareas.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span onClick={() => toggleSubtarea(t._id, i)} className="cursor-pointer">
                        {s.completado ? <FaCheckSquare className="text-green-400" /> : <FaRegSquare className="text-gray-400" />}
                      </span>
                      <span className={s.completado ? 'line-through text-gray-400' : ''}>{s.texto}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tareas;
