// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importa Navigate
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Eventos from './components/Eventos';
import Estadisticas from './components/Estadisticas';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          {/* Redirige la raíz al dashboard o muestra el Dashboard directamente */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Alternativa: <Route path="/" element={<Dashboard />} /> */}
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
