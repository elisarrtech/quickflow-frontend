// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Eventos from './components/Eventos';
import Estadisticas from './pages/Estadisticas';
import Perfil from './pages/Perfil';
// Importar el nuevo componente cuando lo crees
// import Configuracion from './pages/Configuracion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/perfil" element={<Perfil />} />
        {/* Agregar la ruta cuando crees el componente */}
        {/* <Route path="/configuracion" element={<Configuracion />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
