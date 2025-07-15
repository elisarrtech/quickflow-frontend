import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const response = await fetch('https://quickflow-nxg1.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      setMensaje('Registro exitoso ✅');
      setTimeout(() => navigate('/login'), 2000); // Redirigir al login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
        >
          Registrarse
        </button>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {mensaje && <p className="mt-4 text-green-400 text-center">{mensaje}</p>}

        <p className="mt-4 text-sm text-center">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-blue-400 hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
