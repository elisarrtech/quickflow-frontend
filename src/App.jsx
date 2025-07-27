// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // o la ruta correcta donde esté ubicado
import DashboardLayout from './components/DashboardLayout';
import Tareas from './pages/Tareas';
import Eventos from './components/Eventos';
import Estadisticas from './components/Estadisticas'; // Cambio aquí
import Perfil from './pages/Perfil';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/estadisticas" element={<Estadisticas />} /> {/* Ruta para Estadísticas */}
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
