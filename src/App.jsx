// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
