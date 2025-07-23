import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas'; // ✅ Importación correcta
import Estadisticas from './components/Estadisticas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal redirecciona al login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tareas" element={<Tareas />} /> {/* Página separada */}
        <Route path="/estadisticas" element={<Estadisticas />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
