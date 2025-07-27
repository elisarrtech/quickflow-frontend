// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Eventos from './components/Eventos';
import Estadisticas from './components/Estadisticas';
import Perfil from './pages/Perfil';
// Asegúrate de importar tus componentes de Login y Register
import Login from './pages/Login'; // Ajusta la ruta si es necesario
import Register from './pages/Register'; // Ajusta la ruta si es necesario

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas (sin DashboardLayout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas (con DashboardLayout) */}
        <Route element={<DashboardLayout />}>
          {/* Redirige la raíz a /dashboard si el usuario está autenticado 
               (más adelante podemos agregar lógica para verificar autenticación) */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/perfil" element={<Perfil />} />
          
          {/* Redirección por defecto dentro del layout si se accede a una subruta no definida */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
