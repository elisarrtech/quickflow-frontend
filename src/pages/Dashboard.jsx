import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Tareas from "./Tareas";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6">Quickflow</h2>
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard" className="hover:text-blue-400">Inicio</Link>
          <Link to="/tareas" className="hover:text-blue-400">Tareas</Link>
          {/* Puedes agregar esto más adelante si ya existe */}
          {/* <Link to="/usuarios" className="hover:text-blue-400">Usuarios</Link> */}
          <button
            onClick={handleLogout}
            className="mt-10 text-red-400 hover:text-red-500 text-left"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Bienvenido a tu Dashboard 🚀</h1>
        <p className="text-lg mb-4">Aquí podrás gestionar tus tareas y productividad.</p>

        {/* Renderiza el componente de Tareas */}
        <Tareas />

        {/* Tarjetas visuales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Tareas</h3>
            <p className="text-sm text-gray-300">Gestiona tus tareas diarias.</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Progreso</h3>
            <p className="text-sm text-gray-300">Visualiza tu avance.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-white shadow-md flex flex-col justify-between">
  <div>
    <h3 className="text-lg font-semibold mb-1">📈 Estadísticas</h3>
    <p className="text-sm text-gray-300">Consulta informes de productividad.</p>
  </div>
  <div className="mt-4">
    <button
      onClick={() => navigate('/estadisticas')}
      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-200"
    >
      <span>Ver estadísticas</span>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 17a1 1 0 0 1-.7-1.7l4.3-4.3H3a1 1 0 1 1 0-2h11.6l-4.3-4.3A1 1 0 0 1 11.7 3.3l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-.7.3z"/>
      </svg>
    </button>
  </div>
</div>


      </main>
    </div>
  );
}

export default Dashboard;
