import { useState } from "react";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = {
      username: email, // se usa el email como username por ahora
      email,
      password,
    };

    try {
      const response = await fetch("https://quickflow-nxg1.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Registro exitoso. ¡Ahora puedes iniciar sesión!");
        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "❌ Error al registrar el usuario.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-6 text-center font-bold">Crear Cuenta</h2>

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
        {success && <p className="text-green-400 text-sm mb-3">{success}</p>}

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 p-2 rounded">
          Crear Cuenta
        </button>

        <p className="mt-4 text-sm text-center">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
