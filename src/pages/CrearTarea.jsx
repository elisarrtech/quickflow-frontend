import React, { useState } from 'react';

const CrearTarea = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          estado,
          usuario: 'admin' // puedes cambiarlo por quien esté logueado
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al crear tarea');

      setMensaje('✅ Tarea creada con éxito');
      setTitulo('');
      setDescripcion('');
      setEstado('pendiente');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Crear nueva tarea</h1>

      <form onSubmit={handleCrearTarea} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 p-2 rounded font-semibold w-full"
        >
          Crear tarea
        </button>

        {mensaje && <p className="text-green-400">{mensaje}</p>}
        {error && <p className="text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default CrearTarea;
