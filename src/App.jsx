// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Eliminamos Navigate por ahora
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Eventos from './components/Eventos';
import Estadisticas from './components/Estadisticas';
import Perfil from './pages/Perfil';
import Login from './pages/Login'; // Asegúrate de importarlo
import Register from './pages/Register'; // Asegúrate de importarlo

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas (sin DashboardLayout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta raíz muestra el Login */}
        <Route path="/" element={<Login />} /> 
        
        {/* Rutas protegidas (con DashboardLayout) */}
        <Route element={<DashboardLayout />}>
          {/* 
            Esta ruta se activa si alguien va a /dashboard directamente.
            Aquí es donde normalmente verificarías si el usuario está logueado.
            Si no lo está, lo rediriges a /login.
            Si está logueado, muestras el Dashboard.
            Por simplicidad ahora, asumimos que si llega aquí, está logueado.
          */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/perfil" element={<Perfil />} />
          
          {/* Redirección por defecto dentro del layout si se accede a una subruta no definida */}
          {/* Puedes redirigir a dashboard o a login basado en autenticación */}
          <Route path="*" element={<Dashboard />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
