import React, { useState, useEffect } from 'react';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  // Obtener tareas desde el backend
  useEffect(() => {
    const obtenerTareas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setTareas(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setError("No se pudieron cargar las tareas.");
        }
      } catch (error) {
        console.error("Error al obtener tareas:", error);
        setError("Error de conexión al servidor.");
      } finally {
        setCargando(false);
      }
    };

    obtenerTareas();
  }, []);

  // Crear nueva tarea
  const crearTarea = async () => {
    const token = localStorage.getItem('token');

    if (!titulo.trim() || !descripcion.trim()) {
      setError("⚠️ Título y descripción requeridos.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, descripcion }),
      });

      const data = await res.json();

      if (res.ok) {
        setTareas([...tareas, data]);
        setTitulo('');
        setDescripcion('');
        setError('');
      } else {
        setError(data.error || "No se pudo crear la tarea.");
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setError("Error de red al crear la tarea.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">📋 Tareas</h2>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          onClick={crearTarea}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
        >
          Crear Tarea
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">📝 Lista de Tareas</h3>
        {cargando ? (
          <p className="text-gray-400">Cargando tareas...</p>
        ) : tareas.length > 0 ? (
          <div className="space-y-4">
            {tareas.map((tarea) => (
              <div key={tarea._id} className="bg-gray-700 p-3 rounded shadow text-white">
                <strong>{tarea.titulo}</strong>
                <p className="text-sm text-gray-300">{tarea.descripcion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay tareas disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Tareas;
