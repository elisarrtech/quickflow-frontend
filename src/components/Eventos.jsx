// src/components/Eventos.jsx
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaVideo, FaTrash, FaPlus, FaCalendar, FaBell, FaShareAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('reunion'); // reunion, cita, junta, videollamada
  const [participantesInput, setParticipantesInput] = useState(''); // Para ingresar correos separados por coma
  const [participantes, setParticipantes] = useState([]); // Array de objetos {email: '...'}
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [compartirMenuAbierto, setCompartirMenuAbierto] = useState(null); // Para controlar menús de compartir
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Solicitar permisos para notificaciones
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // Cargar eventos del localStorage
  useEffect(() => {
    const eventosGuardados = localStorage.getItem('eventos');
    if (eventosGuardados) {
      setEventos(JSON.parse(eventosGuardados));
    }
  }, []);

  // Guardar eventos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
  }, [eventos]);

  // Notificaciones de eventos próximos
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      eventos.forEach(evento => {
        const tiempoEvento = new Date(`${evento.fecha}T${evento.hora}`);
        const diferencia = tiempoEvento - ahora;
        
        // Notificar 10 minutos antes del evento
        if (diferencia > 0 && diferencia <= 600000) { // 10 minutos en ms
          new Notification('⏰ Evento próximo', {
            body: `${evento.titulo} comienza en 10 minutos`,
            icon: '/favicon.ico'
          });
        }
      });
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [eventos]);

  const crearEvento = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return setError('El título es obligatorio');
    
    // Parsear participantes del input (correos separados por coma)
    let participantesArray = [];
    if (participantesInput.trim()) {
      participantesArray = participantesInput.split(',').map(email => ({ email: email.trim() })).filter(p => p.email);
    }

    const nuevoEvento = {
      id: Date.now(),
      titulo,
      fecha,
      hora,
      tipo,
      participantes: participantesArray // Guardar el array de participantes
    };

    setEventos([...eventos, nuevoEvento]);
    setExito('✅ Evento creado exitosamente.');
    setTimeout(() => setExito(''), 3000);
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const eliminarEvento = (id) => {
    setEventos(eventos.filter(e => e.id !== id));
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setFecha('');
    setHora('');
    setTipo('reunion');
    setParticipantesInput(''); // Limpiar input de participantes
    setParticipantes([]); // Limpiar array de participantes
    setError('');
  };

  // Función para compartir evento por correo
  const compartirEventoPorCorreo = (evento) => {
    const asunto = encodeURIComponent(`Invitación: ${evento.titulo}`);
    
    let cuerpo = `Hola,\n\nHas sido invitado al siguiente evento:\n\n`;
    cuerpo += `Título: ${evento.titulo}\n`;
    cuerpo += `Fecha: ${evento.fecha}\n`;
    cuerpo += `Hora: ${evento.hora}\n`;
    cuerpo += `Tipo: ${evento.tipo}\n`;
    
    if (evento.participantes && evento.participantes.length > 0) {
      const listaParticipantes = evento.participantes.map(p => p.email).join(', ');
      cuerpo += `Participantes: ${listaParticipantes}\n`;
    }
    
    cuerpo = encodeURIComponent(cuerpo);
    
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  };

  // Función para compartir evento por WhatsApp
  const compartirEventoPorWhatsApp = (evento) => {
    let texto = `*Invitación: ${evento.titulo}*\n\n`;
    texto += `Fecha: ${evento.fecha}\n`;
    texto += `Hora: ${evento.hora}\n`;
    texto += `Tipo: ${evento.tipo}\n`;
    
    if (evento.participantes && evento.participantes.length > 0) {
      const listaParticipantes = evento.participantes.map(p => p.email).join(', ');
      texto += `Participantes: ${listaParticipantes}\n`;
    }
    
    const textoCodificado = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${textoCodificado}`, '_blank');
  };

  // Filtrar eventos según el tipo seleccionado
  const eventosFiltrados = filtroTipo === 'todos' 
    ? eventos 
    : eventos.filter(e => e.tipo === filtroTipo);

  // Ordenar eventos por fecha y hora
  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaA - fechaB;
  });

  // Obtener eventos del día seleccionado
  const eventosDelDia = eventosOrdenados.filter(e => 
    e.fecha === fechaSeleccionada.toISOString().split('T')[0]
  );

  // Obtener eventos de hoy
  const eventosHoy = eventosOrdenados.filter(e => 
    e.fecha === new Date().toISOString().split('T')[0]
  );

  // Iconos para tipos de eventos
  const iconosTipo = {
    reunion: <FaUsers className="text-blue-400" />,
    cita: <FaClock className="text-green-400" />,
    junta: <FaUsers className="text-purple-400" />,
    videollamada: <FaVideo className="text-red-400" />
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Mensajes de éxito y error */}
      {exito && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{exito}</div>}
      {error && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500 ease-in-out">{error}</div>}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaCalendarAlt className="text-blue-400" />
          Eventos
        </h3>
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="text-blue-400 hover:text-blue-300"
        >
          <FaPlus />
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={crearEvento} className="mb-4 p-3 bg-gray-700 rounded">
          <input
            type="text"
            placeholder="Título del evento"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
            required
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="p-2 bg-gray-600 text-white rounded"
              required
            />
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="p-2 bg-gray-600 text-white rounded"
              required
            />
          </div>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
          >
            <option value="reunion">Reunión</option>
            <option value="cita">Cita</option>
            <option value="junta">Junta</option>
            <option value="videollamada">Videollamada</option>
          </select>
          <input
            type="text"
            placeholder="Participantes (correos separados por coma)"
            value={participantesInput}
            onChange={(e) => setParticipantesInput(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(false);
                limpiarFormulario();
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtro por tipo de evento */}
      <div className="mb-4">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
        >
          <option value="todos">Todos los eventos</option>
          <option value="reunion">Reuniones</option>
          <option value="cita">Citas</option>
          <option value="junta">Juntas</option>
          <option value="videollamada">Videollamadas</option>
        </select>
      </div>

      {/* Calendario */}
      <div className="mb-4">
        <Calendar
          onChange={setFechaSeleccionada}
          value={fechaSeleccionada}
          className="bg-gray-700 rounded border-0"
          tileClassName={({ date, view }) => {
            // Resaltar días con eventos
            const eventosEnFecha = eventos.filter(e => 
              e.fecha === date.toISOString().split('T')[0]
            );
            return eventosEnFecha.length > 0 ? 'bg-blue-900 text-white' : null;
          }}
        />
      </div>

      {/* Eventos del día seleccionado */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          Eventos para {fechaSeleccionada.toLocaleDateString()}
        </h4>
        <div className="space-y-3">
          {eventosDelDia.length > 0 ? (
            eventosDelDia.map(evento => (
              <div key={evento.id} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{evento.titulo}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                      <FaClock className="text-blue-400" />
                      <span>{evento.hora}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                      {iconosTipo[evento.tipo]}
                      <span className="capitalize">{evento.tipo}</span>
                    </div>
                    {/* Mostrar participantes si existen */}
                    {evento.participantes && evento.participantes.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Invitados: {evento.participantes.map(p => p.email).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* Botones de compartir */}
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
                        className="text-blue-400 hover:text-blue-300"
                        title="Compartir evento"
                      >
                        <FaShareAlt size={14} />
                      </button>
                      
                      {compartirMenuAbierto === `evento-${evento.id}` && (
                        <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              compartirEventoPorCorreo(evento);
                              setCompartirMenuAbierto(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-white hover:bg-gray-600"
                          >
                            <FaEnvelope className="text-blue-300" size={12} /> Correo
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              compartirEventoPorWhatsApp(evento);
                              setCompartirMenuAbierto(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-white hover:bg-gray-600"
                          >
                            <FaWhatsapp className="text-green-300" size={12} /> WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón de eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarEvento(evento.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              <FaCalendar className="mx-auto text-2xl mb-2" />
              <p>No hay eventos para esta fecha</p>
            </div>
          )}
        </div>

        {/* Eventos de hoy (si la fecha seleccionada no es hoy) */}
        {fechaSeleccionada.toISOString().split('T')[0] !== new Date().toISOString().split('T')[0] && eventosHoy.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <FaBell className="text-yellow-400" />
              Eventos de hoy
            </h4>
            <div className="space-y-2">
              {eventosHoy.slice(0, 3).map(evento => (
                <div key={evento.id} className="bg-gray-700 p-2 rounded text-xs">
                  <div className="font-medium text-white">{evento.titulo}</div>
                  <div className="text-gray-300 flex items-center gap-1">
                    <FaClock size={10} />
                    {evento.hora}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de próximos eventos */}
        {eventosOrdenados.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Próximos eventos</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {eventosOrdenados
                .filter(e => new Date(`${e.fecha}T${e.hora}`) > new Date())
                .slice(0, 5)
                .map(evento => (
                  <div key={evento.id} className="text-xs text-gray-400 flex justify-between">
                    <span>{evento.titulo}</span>
                    <span>{evento.fecha} {evento.hora}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Eventos;
