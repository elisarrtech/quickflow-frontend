import React, { useEffect, useState } from 'react';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchTareas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      setTareas(data);
    } catch (err) {
      setError('Error al obtener tareas');
    }
  };

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion }),
      });
      const data = await res.json();
      setTitulo('');
      setDescripcion('');
      fetchTareas(); // recarga
    } catch (err) {
      setError('Error al crear tarea');
    }
  };

  const eliminarTarea = async (id) => {
    await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    fetchTareas();
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Tareas</h2>

      <form onSubmit={handleCrearTarea} className="mb-6">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="p-2 mr-2 rounded bg-gray-700 border border-gray-500"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="p-2 mr-2 rounded bg-gray-700 border border-gray-500"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded">
          Crear
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <ul className="space-y-3">
        {tareas.map((t) => (
          <li key={t._id} className="bg-gray-800 p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{t.titulo}</h3>
              <p className="text-sm">{t.descripcion}</p>
            </div>
            <button
              onClick={() => eliminarTarea(t._id)}
              className="text-red-400 hover:text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tareas;
