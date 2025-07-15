import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://quickflow-nxg1.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        console.log("Token JWT:", data.token);
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-6 text-center font-bold">Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 placeholder-gray-400"
          required
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">
          Entrar
        </button>
        
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-blue-400 hover:underline">Regístrate</a>
        </p>

        {token && <p className="text-green-400 mt-4 break-all">Token: {token}</p>}
      </form>
    </div>
  );
}

export default Login;
