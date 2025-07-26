// src/pages/Eventos.jsx
import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaClock, FaUsers, FaVideo, FaTrash, FaPlus,
  FaCalendar, FaBell, FaShareAlt, FaEnvelope, FaWhatsapp, FaTimes, FaEdit
} from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const API_URL = "https://quickflow-api.onrender.com"; // ✅ Cambia esta URL si es necesario

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('reunion');
  const [participantesInput, setParticipantesInput] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [compartirMenuAbierto, setCompartirMenuAbierto] = useState(null);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // 🔁 GET: cargar eventos desde backend
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(\`\${API_URL}/api/eventos\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const data = await res.json();
        setEventos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los eventos");
      }
    };
    fetchEventos();
  }, []);

  // ⏰ Notificaciones de eventos próximos
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      eventos.forEach(evento => {
        const tiempoEvento = new Date(\`\${evento.fecha}T\${evento.hora}\`);
        const diferencia = tiempoEvento - ahora;
        if (diferencia > 0 && diferencia <= 600000) {
          new Notification("⏰ Evento próximo", {
            body: \`\${evento.titulo} comienza en 10 minutos\`,
            icon: "/favicon.ico"
          });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [eventos]);

  const limpiarFormulario = () => {
    setTitulo('');
    setFecha('');
    setHora('');
    setTipo('reunion');
    setParticipantesInput('');
    setEventoEditando(null);
    setError('');
  };

  // ✅ POST y PUT: crear o actualizar evento
  const crearEvento = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !fecha || !hora) return setError('Faltan campos obligatorios');

    const participantesArray = participantesInput
      .split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email && /\S+@\S+\.\S+/.test(email))
      .map(email => ({ email: email.toLowerCase() }));

    const eventoData = {
      titulo, fecha, hora, tipo, participantes: participantesArray
    };

    try {
      let res, mensaje;
      if (eventoEditando) {
        res = await fetch(\`\${API_URL}/api/eventos/\${eventoEditando._id}\`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`
          },
          body: JSON.stringify(eventoData)
        });
        mensaje = "Evento actualizado correctamente.";
      } else {
        res = await fetch(\`\${API_URL}/api/eventos\`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`
          },
          body: JSON.stringify(eventoData)
        });
        mensaje = "Evento creado correctamente.";
      }

      if (!res.ok) throw new Error("Error en la solicitud");
      const data = await res.json();

      if (eventoEditando) {
        setEventos(prev => prev.map(e => e._id === eventoEditando._id ? data : e));
      } else {
        setEventos(prev => [...prev, data]);
      }

      setExito("✅ " + mensaje);
      limpiarFormulario();
      setMostrarFormulario(false);
      setTimeout(() => setExito(""), 3000);
    } catch (err) {
      console.error(err);
      setError("❌ Error al guardar el evento");
    }
  };

  // 🗑 DELETE: eliminar evento
  const eliminarEvento = async (id) => {
    try {
      const res = await fetch(\`\${API_URL}/api/eventos/\${id}\`, {
        method: "DELETE",
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (!res.ok) throw new Error();
      setEventos(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el evento");
    }
  };

  const editarEvento = (evento) => {
    setEventoEditando(evento);
    setTitulo(evento.titulo);
    setFecha(evento.fecha);
    setHora(evento.hora);
    setTipo(evento.tipo);
    setParticipantesInput(evento.participantes?.map(p => p.email).join(', ') || '');
    setMostrarFormulario(true);
  };

  const compartirEventoPorCorreo = (evento) => {
    const asunto = encodeURIComponent(\`Invitación: \${evento.titulo}\`);
    let cuerpo = \`Hola,\n\nHas sido invitado al siguiente evento:\n\n\`;
    cuerpo += \`Título: \${evento.titulo}\nFecha: \${evento.fecha}\nHora: \${evento.hora}\nTipo: \${evento.tipo}\n\`;
    if (evento.participantes?.length) {
      cuerpo += \`Participantes: \${evento.participantes.map(p => p.email).join(', ')}\n\`;
    }
    cuerpo = encodeURIComponent(cuerpo);
    window.location.href = \`mailto:?subject=\${asunto}&body=\${cuerpo}\`;
  };

  const compartirEventoPorWhatsApp = (evento) => {
    let texto = \`*Invitación: \${evento.titulo}*\n\nFecha: \${evento.fecha}\nHora: \${evento.hora}\nTipo: \${evento.tipo}\n\`;
    if (evento.participantes?.length) {
      texto += \`Participantes: \${evento.participantes.map(p => p.email).join(', ')}\n\`;
    }
    const textoCodificado = encodeURIComponent(texto);
    window.open(\`https://wa.me/?text=\${textoCodificado}\`, '_blank');
  };

  // 🔍 Filtros y ordenamiento
  const eventosFiltrados = filtroTipo === 'todos' ? eventos : eventos.filter(e => e.tipo === filtroTipo);
  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => new Date(\`\${a.fecha}T\${a.hora}\`) - new Date(\`\${b.fecha}T\${b.hora}\`));
  const eventosDelDia = eventosOrdenados.filter(e => e.fecha === fechaSeleccionada.toISOString().split('T')[0]);
  const eventosHoy = eventosOrdenados.filter(e => e.fecha === new Date().toISOString().split('T')[0]);

  // Iconos y colores
  const iconosTipo = {
    reunion: <FaUsers className="text-blue-400" />,
    cita: <FaClock className="text-green-400" />,
    junta: <FaUsers className="text-purple-400" />,
    videollamada: <FaVideo className="text-red-400" />
  };

  const coloresTipo = {
    reunion: 'border-l-4 border-blue-500 bg-blue-500/10',
    cita: 'border-l-4 border-green-500 bg-green-500/10',
    junta: 'border-l-4 border-purple-500 bg-purple-500/10',
    videollamada: 'border-l-4 border-red-500 bg-red-500/10'
  };


  return (
    <div className="bg-gray-800 rounded-xl p-6 h-full">
      {/* Mensajes de éxito y error */}
      {exito && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{exito}</div>}
      {error && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{error}</div>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaCalendarAlt className="text-indigo-400" />
          Gestión de Eventos
        </h2>
        <button 
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(!mostrarFormulario);
          }}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus />
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Evento'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-8 bg-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              {eventoEditando ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </h3>
            <button 
              onClick={() => {
                setMostrarFormulario(false);
                limpiarFormulario();
              }}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <form onSubmit={crearEvento} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Título del evento *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Reunión de equipo..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Fecha *</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Hora *</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Tipo de evento</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="reunion">Reunión</option>
                <option value="cita">Cita</option>
                <option value="junta">Junta</option>
                <option value="videollamada">Videollamada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                Participantes (correos separados por coma o punto y coma)
              </label>
              <input
                type="text"
                value={participantesInput}
                onChange={(e) => setParticipantesInput(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="juan@ejemplo.com, maria@ejemplo.com; pedro@ejemplo.com"
              />
              <p className="text-xs text-gray-400 mt-1">
                Los participantes recibirán una invitación automática.
              </p>
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {eventoEditando ? 'Actualizar Evento' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Calendario y filtros */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filtro por tipo de evento */}
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Filtrar por tipo</h3>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="todos">Todos los eventos</option>
              <option value="reunion">Reuniones</option>
              <option value="cita">Citas</option>
              <option value="junta">Juntas</option>
              <option value="videollamada">Videollamadas</option>
            </select>
          </div>

          {/* Calendario */}
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Calendario</h3>
            <Calendar
              onChange={setFechaSeleccionada}
              value={fechaSeleccionada}
              className="bg-gray-600 rounded-lg border-0 w-full"
              tileClassName={({ date, view }) => {
                const eventosEnFecha = eventos.filter(e => 
                  e.fecha === date.toISOString().split('T')[0]
                );
                return eventosEnFecha.length > 0 
                  ? 'bg-indigo-900 text-white hover:bg-indigo-800' 
                  : 'hover:bg-gray-500';
              }}
            />
          </div>

          {/* Eventos de hoy */}
          {eventosHoy.length > 0 && (
            <div className="bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaBell className="text-yellow-400" />
                Eventos de hoy
              </h3>
              <div className="space-y-3">
                {eventosHoy.slice(0, 3).map(evento => (
                  <div key={evento.id} className="bg-gray-600 p-3 rounded-lg">
                    <div className="font-medium text-white truncate">{evento.titulo}</div>
                    <div className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                      <FaClock size={12} />
                      {evento.hora}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Lista de eventos */}
        <div className="lg:col-span-2">
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Eventos para {fechaSeleccionada.toLocaleDateString()}
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {eventosDelDia.length > 0 ? (
                eventosDelDia.map(evento => (
                  <div 
                    key={evento.id} 
                    className={`${coloresTipo[evento.tipo]} bg-gray-600 rounded-lg p-4 transition-all hover:shadow-lg`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-lg">{evento.titulo}</h4>
                          {iconosTipo[evento.tipo]}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaClock className="text-indigo-400" />
                            <span>{evento.hora}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaCalendar className="text-indigo-400" />
                            <span>{evento.fecha}</span>
                          </div>
                          
                          {evento.participantes && evento.participantes.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FaUsers className="text-indigo-400" />
                              <span>{evento.participantes.length} participantes</span>
                            </div>
                          )}
                        </div>
                        
                        {evento.participantes && evento.participantes.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-400">Participantes:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {evento.participantes.map((p, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded"
                                >
                                  {p.email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {/* Botón de compartir */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompartirMenuAbierto(
                                compartirMenuAbierto === `evento-${evento.id}` 
                                  ? null 
                                  : `evento-${evento.id}`
                              );
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-500 rounded-full transition-colors"
                            title="Compartir evento"
                          >
                            <FaShareAlt size={16} />
                          </button>
                          
                          {compartirMenuAbierto === `evento-${evento.id}` && (
                            <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  compartirEventoPorCorreo(evento);
                                  setCompartirMenuAbierto(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-600"
                              >
                                <FaEnvelope className="text-blue-400" /> Correo
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  compartirEventoPorWhatsApp(evento);
                                  setCompartirMenuAbierto(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-600"
                              >
                                <FaWhatsapp className="text-green-400" /> WhatsApp
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => editarEvento(evento)}
                          className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-500 rounded-full transition-colors"
                          title="Editar evento"
                        >
                          <FaEdit size={16} />
                        </button>
                        
                        <button
                          onClick={() => eliminarEvento(evento.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-500 rounded-full transition-colors"
                          title="Eliminar evento"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <FaCalendar className="mx-auto text-4xl text-gray-500 mb-3" />
                  <p className="text-gray-400">No hay eventos programados para esta fecha</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Lista de próximos eventos */}
          {eventosOrdenados.length > 0 && (
            <div className="mt-6 bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Próximos eventos</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {eventosOrdenados
                  .filter(e => new Date(`${e.fecha}T${e.hora}`) > new Date())
                  .slice(0, 5)
                  .map(evento => (
                    <div key={evento.id} className="flex justify-between items-center p-3 bg-gray-600 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{evento.titulo}</div>
                        <div className="text-gray-400 text-sm">{evento.fecha} a las {evento.hora}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${coloresTipo[evento.tipo].replace('border-l-4 ', '')}`}>
                        {evento.tipo}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Eventos;
