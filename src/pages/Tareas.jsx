import React, { useState, useEffect } from 'react';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  // Obtener tareas desde el backend
  useEffect(() => {
    const obtenerTareas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setTareas(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setError("No se pudieron cargar las tareas.");
        }
      } catch (error) {
        console.error("Error al obtener tareas:", error);
        setError("Error de conexión al servidor.");
      }
    };

    obtenerTareas();
  }, []);

  // Crear una nueva tarea
  const crearTarea = async () => {
    const token = localStorage.getItem('token');

    if (!titulo.trim() || !descripcion.trim()) {
      setError("Título y descripción requeridos.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descripcion,
        }),
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
    <div style={{ padding: '2rem' }}>
      <h2>📋 Tareas</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button onClick={crearTarea}>Crear Tarea</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>📝 Lista de Tareas</h3>
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div key={tarea._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
              <strong>{tarea.titulo}</strong> - {tarea.descripcion}
            </div>
          ))
        ) : (
          <p>No hay tareas disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Tareas;
