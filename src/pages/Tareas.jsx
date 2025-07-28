// src/pages/Tareas.jsx
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { RUTAS_API } from '../utils/apiRoutes';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [categoriasExistentes, setCategoriasExistentes] = useState([]);

  useEffect(() => {
    const obtenerTareas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(RUTAS_API.tareas, {
          headers: { Authorization: 'Bearer ' + token }
        });
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

  const crearTarea = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(RUTAS_API.tareas, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ titulo: nuevaTarea })
      });
      const data = await res.json();
      if (res.ok) {
        setTareas([...tareas, data]);
        setNuevaTarea('');
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  const actualizarTarea = async (id, actualizado) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${RUTAS_API.tareas}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(actualizado)
      });
      if (res.ok) {
        setTareas(tareas.map(t => (t._id === id ? { ...t, ...actualizado } : t)));
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${RUTAS_API.tareas}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (res.ok) {
        setTareas(tareas.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Mis Tareas</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="Nueva tarea"
          />
          <button
            onClick={crearTarea}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            <FaPlus />
          </button>
        </div>

        <div className="space-y-4">
          {tareas.map((tarea) => (
            <div
              key={tarea._id}
              className="bg-gray-800 p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                {tarea.categoria && (
                  <span className="text-sm text-gray-400">Categoría: {tarea.categoria}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => actualizarTarea(tarea._id, { completada: !tarea.completada })}
                  className="text-green-400 hover:text-green-600"
                >
                  <FaCheckCircle />
                </button>
                <button
                  onClick={() => eliminarTarea(tarea._id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tareas;
