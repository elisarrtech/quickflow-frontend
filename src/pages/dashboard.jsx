function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6">Quickflow</h2>
        <nav className="flex flex-col space-y-4">
          <a href="/dashboard" className="hover:text-blue-400">Inicio</a>
          <a href="#" className="hover:text-blue-400">Tareas</a>
          <a href="#" className="hover:text-blue-400">Usuarios</a>
          <a href="/login" className="mt-10 text-red-400 hover:text-red-500">Cerrar sesión</a>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Bienvenido a tu Dashboard 🚀</h1>
        <p className="text-lg mb-4">Aquí podrás gestionar tus tareas y productividad.</p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Tareas</h3>
            <p className="text-sm text-gray-300">Gestiona tus tareas diarias.</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Progreso</h3>
            <p className="text-sm text-gray-300">Visualiza tu avance.</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Estadísticas</h3>
            <p className="text-sm text-gray-300">Consulta reportes de productividad.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
