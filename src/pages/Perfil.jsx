// src/pages/Perfil.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState(''); // 'exito' o 'error'
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const obtenerPerfil = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNombre(data.nombre);
        setEmail(data.email);
      }
    };
    obtenerPerfil();
  }, []);

  const actualizarPerfil = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/perfil`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        setMensajeTipo('exito');
      } else {
        setMensaje('Error al actualizar el perfil');
        setMensajeTipo('error');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMensaje('Error de red o del servidor');
      setMensajeTipo('error');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div className="text-white p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>
        <div className="mb-4">
          <label className="block mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white"
          />
        </div>
        <button
          onClick={actualizarPerfil}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mr-4"
        >
          Guardar cambios
        </button>
        <button
          onClick={cerrarSesion}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
        >
          Cerrar sesión
        </button>

        {mensaje && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              mensajeTipo === 'exito' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
