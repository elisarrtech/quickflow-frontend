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
  FaTimes
} from 'react-icons/fa';
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

  useEffect(() => {
    Notification.requestPermission();
  }, []);

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
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const ordenadas = data.sort((a, b) =>
            a.estado !== b.estado
              ? a.estado === 'pendiente'
                ? -1
                : 1
              : new Date(a.fecha) - new Date(b.fecha)
          );
          setTareas(ordenadas);
        }
      } catch {}
    };
    obtenerTareas();
  }, []);

  const crearTarea = async () => {
    if (!titulo.trim()) return setError('El título es obligatorio');
    if (
      tareas.some(
        t => t.titulo.toLowerCase() === titulo.trim().toLowerCase()
      )
    )
      return setError('Ya existe una tarea con ese título');

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

    const res = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setTareas(prev => [...prev, data]);
      limpiarFormulario();
    }
  };

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
    setError('');
  };

  const eliminarTarea = async id => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTareas(prev => prev.filter(t => t._id !== id));
  };

  const editarTarea = t => {
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
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo,
        descripcion,
        fecha,
        hora,
        categoria,
        nota,
        enlace,
        subtareas
      })
    });
    const data = await res.json();
    if (res.ok) {
      setTareas(prev => prev.map(t => (t._id === modoEdicion ? data : t)));
      setModoEdicion(null);
      limpiarFormulario();
    }
  };

  const toggleEstado = async t => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/tasks/${t._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...t,
        estado: t.estado === 'pendiente' ? 'completada' : 'pendiente'
      })
    });
    if (res.ok)
      setTareas(prev =>
        prev.map(x =>
          x._id === t._id
            ? { ...x, estado: x.estado === 'pendiente' ? 'completada' : 'pendiente' }
            : x
        )
      );
  };

  const toggleSubtarea = (id, i) => {
    setTareas(prev =>
      prev.map(t => {
        if (t._id === id) {
          const s = [...t.subtareas];
          s[i].completado = !s[i].completado;
          return { ...t, subtareas: s };
        }
        return t;
      })
    );
  };

  const eliminarSubtarea = index => {
    setSubtareas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      {/* TODO: insertar interfaz visual aquí (formulario, tareas, etc.) */}
    </DashboardLayout>
  );
};

export default Tareas;
