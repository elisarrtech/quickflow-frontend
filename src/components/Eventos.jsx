
// src/components/Eventos.jsx
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaVideo, FaTrash, FaPlus } from 'react-icons/fa';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('reunion'); // reunion, cita, junta, videollamada
  const [participantes, setParticipantes] = useState('');
  // En Eventos.jsx, agrega estado para filtro:
  const [filtroTipo, setFiltroTipo] = useState('todos');
  // Filtrar eventos según el tipo seleccionado
  const eventosFiltrados = filtroTipo === 'todos' 
  ? eventosOrdenados 
  : eventosOrdenados.filter(e => e.tipo === filtroTipo);

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

  // En el componente Eventos.jsx, agrega este useEffect:
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
    if (!titulo || !fecha || !hora) return;

    const nuevoEvento = {
      id: Date.now(),
      titulo,
      fecha,
      hora,
      tipo,
      participantes
    };

    setEventos([...eventos, nuevoEvento]);
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
    setParticipantes('');
  };

  // Ordenar eventos por fecha y hora
  const eventosOrdenados = [...eventos].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaA - fechaB;
  });

  // Obtener eventos de hoy
  const eventosHoy = eventosOrdenados.filter(e => 
    e.fecha === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
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
            placeholder="Participantes (opcional)"
            value={participantes}
            onChange={(e) => setParticipantes(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
          />
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

      <div className="space-y-3">
        {eventosHoy.length > 0 ? (
          eventosHoy.map(evento => (
            <div key={evento.id} className="bg-gray-700 p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white">{evento.titulo}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                    <FaClock className="text-blue-400" />
                    <span>{evento.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                    <FaUsers className="text-green-400" />
                    <span className="capitalize">{evento.tipo}</span>
                  </div>
                  {evento.participantes && (
                    <div className="text-xs text-gray-400 mt-1">
                      Participantes: {evento.participantes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => eliminarEvento(evento.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            <FaCalendarAlt className="mx-auto text-2xl mb-2" />
            <p>No hay eventos programados para hoy</p>
          </div>
        )}
      </div>

      {eventos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Próximos eventos</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {eventosOrdenados.slice(0, 5).map(evento => (
              <div key={evento.id} className="text-xs text-gray-400 flex justify-between">
                <span>{evento.titulo}</span>
                <span>{evento.fecha} {evento.hora}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Eventos;
