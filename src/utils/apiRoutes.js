// src/utils/apiRoutes.js
const API = import.meta.env.VITE_API_URL;

export const RUTAS_API = {
  tareas: `${API}/api/tareas`,
  eventos: `${API}/api/eventos`,
  perfil: `${API}/api/perfil`,
  login: `${API}/api/login`,
  register: `${API}/api/register`,
  subirArchivo: `${API}/api/upload`,
};

