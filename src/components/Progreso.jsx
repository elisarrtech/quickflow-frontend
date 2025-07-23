// src/components/Progreso.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Progreso = () => {
  const [tareas, setTareas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTareas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTareas(data);
        else setError(data.error || 'No se pudo cargar el progreso.');
      } catch (err) {
        setError('Error de conexión con el servidor.');
      }
    };
    fetchTareas();
  }, []);

  const total = tareas.length;
  const completadas = tareas.filter(t => t.estado === 'completada').length;
  const porcentaje = total > 0 ? ((completadas / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <button onClick={() => navigate('/dashboard')} className="text-blue-400 mb-4">← Volver</button>
      <h2 className="text-2xl font-bold mb-6">📌 Progreso General</h2>

      {error && <p className="text-red-400">{error}</p>}

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="mb-2">Tareas completadas: <span className="font-bold">{completadas}</span> / {total}</p>
        <div className="w-full bg-gray-700 h-6 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-6 transition-all duration-300"
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        <p className="mt-2 text-right text-sm text-gray-300">{porcentaje}% completado</p>
      </div>
    </div>
  );
};

export default Progreso;
