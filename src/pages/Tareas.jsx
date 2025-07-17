import { useEffect, useState } from "react";

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Tareas recibidas:", data);

        if (Array.isArray(data)) {
          setTareas(data);
        } else {
          console.error("La respuesta no es una lista:", data);
        }
      } catch (error) {
        console.error("Error al obtener tareas:", error);
      }
    };

    fetchTareas();
  }, []);

  const handleCrearTarea = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descripcion,
        }),
      });

      const nuevaTarea = await response.json();
      if (nuevaTarea._id) {
        setTareas([...tareas, nuevaTarea]);
        setTitulo("");
        setDescripcion("");
      } else {
        console.error("Error al crear tarea:", nuevaTarea);
      }
    } catch (error) {
      console.error("Error en la petición POST:", error);
    }
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Tus Tareas</h2>

      {/* Crear nueva tarea */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="p-2 text-black rounded mr-2"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="p-2 text-black rounded mr-2"
        />
        <button
          onClick={handleCrearTarea}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear Tarea
        </button>
      </div>

      {/* Listado de tareas */}
      <ul className="space-y-4">
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => (
            <li key={tarea._id} className="bg-gray-700 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{tarea.titulo}</h3>
              <p className="text-gray-300">{tarea.descripcion}</p>
              <p className="text-sm text-gray-400">Estado: {tarea.estado}</p>
              <p className="text-sm text-gray-500">Fecha: {tarea.fecha}</p>
            </li>
          ))
        ) : (
          <p>No hay tareas por mostrar.</p>
        )}
      </ul>
    </div>
  );
}

export default Tareas;
