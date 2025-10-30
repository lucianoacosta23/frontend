import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Court } from '../../components/CourtCard';
import '../../static/css/reservationPage.css';

interface OccupiedSlot {
  ReservationDate: string;
  ReservationTime: string;
}

interface Business {
  id: number;
  businessName: string;
  name?: string;
  address?: string;
  openingAt: string;  // Ej: "08:00"
  closingAt: string;  // Ej: "22:00"
}

interface PitchWithReservations extends Court {
  reservations?: OccupiedSlot[];
  business?: Business;
}

interface UserData {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export default function ReservePitchPageMakeReservation(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pitch, setPitch] = useState<PitchWithReservations | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Función para generar horarios basados en el horario del negocio
  const generateTimeSlots = useCallback((openingAt: string, closingAt: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Convertir horas de string a números
    const openTime = parseInt(openingAt.split(':')[0]);
    const closeTime = parseInt(closingAt.split(':')[0]);
    
    // Validar que los horarios sean válidos
    if (isNaN(openTime) || isNaN(closeTime) || openTime >= closeTime) {
      console.warn('Horarios de negocio inválidos, usando horarios por defecto');
      return generateDefaultTimeSlots();
    }
    
    // Generar slots cada hora desde openingAt hasta closingAt (exclusivo)
    for (let hour = openTime; hour < closeTime; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}`;
      const label = `${startTime}:00 - ${endTime}:00`;
      
      slots.push({
        time: startTime, // 🎯 FORMATO CONSISTENTE: solo hora sin minutos
        label: label,
        available: true
      });
    }
    
    console.log('🎯 Time slots generados:', slots);
    return slots;
  }, []);

  // Función para horarios por defecto (fallback)
  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const defaultSlots: TimeSlot[] = [];
    for (let hour = 8; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}`;
      const label = `${startTime} - ${endTime}`;
      
      defaultSlots.push({
        time: startTime,
        label: label,
        available: true
      });
    }
    return defaultSlots;
  };

  // Función para decodificar el token JWT
  const decodeToken = useCallback((token: string): UserData | null => {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const userData = JSON.parse(decodedPayload);
      
      return {
        id: userData.id || userData.userId || 0,
        email: userData.email || '',
        name: userData.name || userData.username || '',
        role: userData.role || ''
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }, []);

  // Función para limpiar la autenticación
  const clearAuth = useCallback(() => {
    localStorage.removeItem('user');
    setToken(null);
    setUserData(null);
  }, []);

  // Obtener token y datos del usuario desde localStorage
  useEffect(() => {
    const getAuthData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.token) {
            setToken(parsed.token);
            const decodedUser = decodeToken(parsed.token);
            if (decodedUser) {
              setUserData(decodedUser);
            }
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error obteniendo datos de autenticación:', error);
        clearAuth();
      }
    };

    getAuthData();
  }, [clearAuth, decodeToken]);

  // Función para formatear fecha a string YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Función para verificar si un horario está disponible
  // 🎯 MEJORAR LA FUNCIÓN isTimeSlotAvailable con más debugging y validación
  const isTimeSlotAvailable = useCallback((selectedDate: string, time: string): boolean => {
    if (!selectedDate || !time) {
      console.log('🎯 isTimeSlotAvailable: Fecha o hora faltante', { selectedDate, time });
      return true;
    }

    if (occupiedSlots.length === 0) {
      console.log('🎯 isTimeSlotAvailable: No hay slots ocupados');
      return true;
    }

    console.log('🎯 Verificando disponibilidad para:', { selectedDate, time });
    console.log('🎯 Slots ocupados:', occupiedSlots);

    // Buscar si existe algún horario ocupado en la misma fecha y hora
    const isOccupied = occupiedSlots.some(slot => {
      const slotDate = new Date(slot.ReservationDate);
      const formattedSlotDate = formatDate(slotDate);
      
      // Normalizar el tiempo del slot ocupado
      let slotTime = slot.ReservationTime;
      
      // Si viene con segundos (ej: "12:00:00"), removerlos
      if (slotTime && slotTime.includes(':')) {
        const timeParts = slotTime.split(':');
        slotTime = `${timeParts[0].padStart(2, '0')}`;
      }
      
      console.log('🎯 Comparando:', {
        slotDate: formattedSlotDate,
        selectedDate,
        slotTime,
        inputTime: time,
        dateMatch: formattedSlotDate === selectedDate,
        timeMatch: slotTime === time
      });
      
      // Comparar si es el mismo día y la misma hora
      const isSameDay = formattedSlotDate === selectedDate;
      const isSameTime = slotTime === time;
      
      return isSameDay && isSameTime;
    });

    console.log('🎯 Resultado disponibilidad:', !isOccupied);
    return !isOccupied;
  }, [occupiedSlots]);

  // Función para obtener horarios ocupados de la cancha
  // 🎯 MEJORAR fetchOccupiedSlots con mejor debugging
  const fetchOccupiedSlots = useCallback(async (pitchId: string, authToken: string) => {
    try {
      console.log('🎯 Obteniendo slots ocupados para cancha:', pitchId);
      
      if (!authToken) {
        console.log('🎯 No hay token disponible');
        return [];
      }

      const response = await fetch(`http://localhost:3000/api/reservations/findOccupiedSlotsByPitch/${pitchId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${authToken}` 
        },
      });

      console.log('🎯 Response status:', response.status);

      if (response.ok) {
        const slotsData = await response.json();
        console.log('🎯 Datos recibidos del backend:', slotsData);
        
        const slots = Array.isArray(slotsData) 
          ? slotsData 
          : slotsData.data || slotsData.occupiedSlots || slotsData.reservations || [];
        
        console.log('🎯 Slots procesados:', slots);
        console.log('🎯 Cantidad de slots ocupados:', slots.length);
        
        setOccupiedSlots(slots);
        return slots;
      } else {
        console.log('🎯 Error en response:', response.status);
        const errorText = await response.text();
        console.log('🎯 Error text:', errorText);
      }
      return [];
    } catch (error) {
      console.error('🎯 Error obteniendo horarios ocupados:', error);
      return [];
    }
  }, []);

  const fetchPitch = useCallback(async (pitchId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!pitchId) throw new Error('ID de cancha faltante');
      
      if (!token) {
        alert('Debes iniciar sesión para reservar una cancha');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/pitchs/getOne/${pitchId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
      });

      if (response.status === 401) {
        clearAuth();
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      let pitchData: PitchWithReservations;
      if (responseData.data) {
        pitchData = responseData.data;
      } else if (responseData.pitch) {
        pitchData = responseData.pitch;
      } else {
        pitchData = responseData;
      }

      setPitch(pitchData);

      // Generar timeSlots basados en el horario del negocio
      if (pitchData.business?.openingAt && pitchData.business?.closingAt) {
        const generatedSlots = generateTimeSlots(
          pitchData.business.openingAt,
          pitchData.business.closingAt
        );
        setTimeSlots(generatedSlots);
      } else {
        // Fallback a horarios por defecto
        setTimeSlots(generateDefaultTimeSlots());
      }

      await fetchOccupiedSlots(pitchId, token);

    } catch (err) {
      console.error('Error en fetchPitch:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la cancha');
    } finally {
      setLoading(false);
    }
  }, [token, navigate, fetchOccupiedSlots, clearAuth, generateTimeSlots]);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        if (!token) {
          navigate('/login');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }

    if (!id) {
      setError('ID de cancha inválida');
      setLoading(false);
      return;
    }
    
    fetchPitch(id);
  }, [id, token, fetchPitch, navigate]);

  // Actualizar disponibilidad de horarios cuando cambia la fecha
  useEffect(() => {
    if (date) {
      setSelectedTime(''); // Resetear selección al cambiar fecha
    }
  }, [date]);

  // 🎯 AGREGAR useEffect para refrescar disponibilidad cuando cambian los slots ocupados
  useEffect(() => {
    if (date && timeSlots.length > 0) {
      console.log('🎯 Recalculando disponibilidad para fecha:', date);
      console.log('🎯 Slots ocupados actuales:', occupiedSlots);
      
      // Forzar actualización de la disponibilidad
      const updatedSlots = timeSlots.map(slot => ({
        ...slot,
        available: isTimeSlotAvailable(date, slot.time)
      }));
      
      console.log('🎯 Slots con disponibilidad actualizada:', updatedSlots);
      setTimeSlots(updatedSlots);
    }
  }, [date, occupiedSlots, isTimeSlotAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch) return;
    if (!date || !selectedTime) {
      setError('Selecciona fecha y horario para la reserva');
      return;
    }
    
    // 🎯 DOBLE VERIFICACIÓN DE DISPONIBILIDAD antes de enviar
    console.log('🎯 Verificación final de disponibilidad:', { date, selectedTime });
    
    // Refrescar slots ocupados antes de la verificación final
    if (id && token) {
      await fetchOccupiedSlots(id, token);
    }
    
    // Verificar disponibilidad después del refresh
    if (!isTimeSlotAvailable(date, selectedTime)) {
      setError('❌ Este horario ya no está disponible. Alguien más lo reservó. Por favor selecciona otro horario.');
      return;
    }

    if (!token || !userData) {
      alert('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const datetime = new Date(`${date}`);
      if (isNaN(datetime.getTime())) throw new Error('Fecha inválida');

      // Verificar que la fecha no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      datetime.setHours(0, 0, 0, 0);
      
      if (datetime < today) {
        throw new Error('No puedes reservar en fechas pasadas');
      }

      const body = {
        ReservationDate: date,
        ReservationTime: `${selectedTime}:00:00`, // 🎯 FORMATO COMPLETO PARA EL BACKEND
        pitch: pitch.id,
        user: userData.id,
        status: 'pending' // 🎯 USAR 'pending' en lugar de 'pendiente'
      };

      console.log('🎯 Enviando reserva con datos:', body);

      const res = await fetch('http://localhost:3000/api/reservations/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        clearAuth();
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        let msg = `Error ${res.status}`;
        try {
          const j = JSON.parse(txt);
          msg = j.message || j.error || msg;
        } catch {
          msg = txt || msg;
        }
        
        // 🎯 MANEJO ESPECÍFICO DE CONFLICTO DE HORARIOS
        if (res.status === 409 || msg.includes('already reserved') || msg.includes('conflicto') || msg.includes('ocupado')) {
          throw new Error('❌ Este horario ya fue reservado por otro usuario. Por favor selecciona otro horario.');
        }
        
        if (msg.includes('User not found')) {
          throw new Error('Error en el sistema: usuario no encontrado. Por favor contacta con soporte.');
        }
        
        throw new Error(msg);
      }

      const result = await res.json();
      console.log('🎯 Reserva creada exitosamente:', result);

      // 🎯 ACTUALIZAR SLOTS OCUPADOS INMEDIATAMENTE
      if (id) {
        await fetchOccupiedSlots(id, token);
      }

      alert('✅ Reserva creada correctamente');
      navigate('/my-reservations'); // 🎯 REDIRIGIR A MIS RESERVAS en lugar de la lista general
    } catch (err) {
      console.error('🎯 Error en handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para obtener horarios ocupados del día seleccionado
  const getBusyTimesForSelectedDate = useCallback((): string[] => {
    if (!date || occupiedSlots.length === 0) return [];

    return occupiedSlots
      .filter(slot => {
        const slotDate = new Date(slot.ReservationDate);
        return formatDate(slotDate) === date;
      })
      .map(slot => {
        const slotTime = slot.ReservationTime;
        return `${slotTime}`;
      })
      .sort();
  }, [date, occupiedSlots]);

  const busyTimes = getBusyTimesForSelectedDate();

  // Función para formatear la fecha en español
  const formatSpanishDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para ir al login
  const goToLogin = () => {
    clearAuth();
    navigate('/login');
  };

  // Estados de carga
  if (!token) {
    return (
      <div className="reserve-pitch-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Verificando autenticación...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reserve-pitch-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando información de la cancha...</p>
      </div>
    );
  }

  if (error && !error.includes('no está disponible')) {
    return (
      <div className="reserve-pitch-error">
        <div className="error-message">
          <h3>❌ Error al cargar cancha</h3>
          <p>{error}</p>
        </div>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <button onClick={() => fetchPitch(id!)} className="retry-button">
            Reintentar
          </button>
          <button onClick={goToLogin} className="secondary-button">
            Iniciar Sesión Nuevamente
          </button>
          <button onClick={() => navigate('/reserve-pitch')} className="secondary-button">
            ← Volver a canchas
          </button>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="reserve-pitch-error">
        <div className="error-message">
          <h3>⚠️ No se encontró la cancha</h3>
          <p>La cancha solicitada no existe o no está disponible.</p>
        </div>
        <button onClick={() => navigate('/reserve-pitch')} className="retry-button">
          ← Volver a canchas
        </button>
      </div>
    );
  }

  return (
    <div className="reserve-pitch-container">
      {/* Header Section */}
      <div className="reserve-pitch-header">
        <button 
          onClick={() => navigate('/reserve-pitch')} 
          className="back-button"
        >
          ← Volver a canchas
        </button>
        <h1 className="reserve-pitch-title">🏟️ Reservar Cancha</h1>
        <p className="reserve-pitch-subtitle">
          Completa los datos para realizar tu reserva
        </p>
      </div>

      {/* User Info */}
      {userData && (
        <div style={{
          background: '#e8f4fd',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #3498db'
        }}>
          <strong>👤 Usuario:</strong> {userData.email || userData.name || 'Usuario'} 
          {userData.role && <span style={{marginLeft: '10px'}}>| 🎯 Rol: {userData.role}</span>}
          <span style={{marginLeft: '10px'}}>| 🆔 ID: {userData.id}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="reservation-content">
        {/* Pitch Card */}
        <div className="pitch-card-large">
          <div className="pitch-image-section">
            <img
              src={pitch.imageUrl || 'https://via.placeholder.com/600x400?text=Cancha+Deportiva'}
              alt={`Cancha ${pitch.id}`}
              className="pitch-image-large"
            />
            <div className="pitch-badges">
              <span className="pitch-id-badge">Cancha #{pitch.id}</span>
              {pitch.roof && <span className="feature-badge covered">🏠 Cubierta</span>}
              <span className="feature-badge size">📏 {pitch.size}</span>
              <span className="feature-badge ground">🌿 {pitch.groundType}</span>
              {pitch.business?.openingAt && pitch.business?.closingAt && (
                <span className="feature-badge hours">🕒 {pitch.business.openingAt} - {pitch.business.closingAt}</span>
              )}
            </div>
          </div>
          
          <div className="pitch-details-section">
            <div className="pitch-header">
              <h2>{pitch.business?.businessName || pitch.business?.name || 'Negocio'}</h2>
              <div className="price-tag">
                <span className="price-label">Precio por hora</span>
                <span className="price-amount">${pitch.price}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <strong>Dirección:</strong>
                <span>{pitch.business?.address || 'Dirección no disponible'}</span>
              </div>
            </div>

            {/* Información de horario del negocio */}
            {pitch.business?.openingAt && pitch.business?.closingAt && (
              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <div className="detail-content">
                  <strong>Horario de atención:</strong>
                  <span>{pitch.business.openingAt} - {pitch.business.closingAt}</span>
                </div>
              </div>
            )}

            {/* Información de disponibilidad - MODIFICADO */}
            <div className="availability-info">
              <div className="availability-header">
                <span className="availability-icon">📊</span>
                <strong>Disponibilidad del día</strong>
              </div>
              <div className="availability-stats">
                {date ? (
                  <span className="stat-item">
                    Horarios ocupados hoy: <strong>{busyTimes.length}</strong> de {timeSlots.length}
                  </span>
                ) : (
                  <span className="stat-item">
                    Selecciona una fecha para ver disponibilidad
                  </span>
                )}
              </div>
              {date && (
                <div className="availability-details">
                  <div className="availability-progress">
                    <div 
                      className="progress-bar"
                      style={{
                        width: `${(busyTimes.length / timeSlots.length) * 100}%`,
                        backgroundColor: busyTimes.length === 0 ? '#2ecc71' : 
                                       busyTimes.length === timeSlots.length ? '#e74c3c' : '#f39c12'
                      }}
                    ></div>
                  </div>
                  <div className="availability-status">
                    {busyTimes.length === 0 && (
                      <span className="status-available">✅ Totalmente disponible</span>
                    )}
                    {busyTimes.length > 0 && busyTimes.length < timeSlots.length && (
                      <span className="status-partial">⚠️ Parcialmente ocupada</span>
                    )}
                    {busyTimes.length === timeSlots.length && (
                      <span className="status-full">❌ Completamente ocupada</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏠</div>
                <div className="feature-info">
                  <div className="feature-label">Cubierta</div>
                  <div className="feature-value">{pitch.roof ? 'Sí' : 'No'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📏</div>
                <div className="feature-info">
                  <div className="feature-label">Tamaño</div>
                  <div className="feature-value">{pitch.size || 'No especificado'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <div className="feature-info">
                  <div className="feature-label">Tipo de suelo</div>
                  <div className="feature-value">{pitch.groundType || 'No especificado'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏰</div>
                <div className="feature-info">
                  <div className="feature-label">Horarios disponibles</div>
                  <div className="feature-value">{timeSlots.length} turnos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="reservation-form-container">
          <div className="form-header">
            <h3>📅 Selecciona fecha y horario</h3>
            <p>Elige cuándo quieres reservar esta cancha (turnos de 1 hora)</p>
            {pitch.business?.openingAt && pitch.business?.closingAt && (
              <p style={{fontSize: '0.9rem', color: '#3498db', marginTop: '5px'}}>
                Horario del negocio: {pitch.business.openingAt} - {pitch.business.closingAt}
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📅</span>
                Fecha de reserva
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>

            {/* Selector de horarios */}
            {date && (
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⏰</span>
                  Horario disponible (1 hora)
                  {timeSlots.length > 0 && (
                    <span style={{fontSize: '0.8rem', color: '#7f8c8d', marginLeft: '8px'}}>
                      ({timeSlots.length} turnos disponibles)
                    </span>
                  )}
                </label>
                <div className="time-slots-grid">
                  {timeSlots.map((slot) => {
                    const isAvailable = isTimeSlotAvailable(date, slot.time);
                    const isSelected = selectedTime === slot.time;
                    
                    // 🎯 DEBUGGING VISUAL
                    console.log(`🎯 Slot ${slot.time}: disponible=${isAvailable}, seleccionado=${isSelected}`);
                    
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot ${isSelected ? 'time-slot-selected' : ''} ${
                          isAvailable ? 'time-slot-available' : 'time-slot-unavailable'
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            console.log('🎯 Seleccionando horario:', slot.time);
                            setSelectedTime(slot.time);
                          } else {
                            console.log('🎯 Horario no disponible:', slot.time);
                          }
                        }}
                        disabled={!isAvailable}
                        title={isAvailable ? 'Horario disponible' : 'Horario ocupado'}
                      >
                        <div className="time-slot-content">
                          <div className="time-slot-label">{slot.label}</div>
                          <div className="time-slot-status">
                            {isAvailable ? '✅ Disponible' : '❌ Ocupado'}
                          </div>
                          {/* 🎯 DEBUG INFO - REMOVER EN PRODUCCIÓN */}
                          <div style={{fontSize: '8px', color: '#666'}}>
                            Debug: {slot.time}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedTime && (
                  <div className="selected-time-info">
                    <strong>Horario seleccionado:</strong> {timeSlots.find(slot => slot.time === selectedTime)?.label}
                  </div>
                )}
              </div>
            )}

            {/* Mostrar horarios ocupados si hay una fecha seleccionada */}
            {date && busyTimes.length > 0 && (
              <div className="busy-times-warning">
                <div className="warning-header">
                  <span className="warning-icon">⏰</span>
                  <strong>Horarios ocupados para el {formatSpanishDate(date)}:</strong>
                </div>
                <div className="busy-times-list">
                  {busyTimes.map((busyTime, index) => (
                    <span key={index} className="busy-time-badge">
                      {busyTime} hs
                    </span>
                  ))}
                </div>
                <p className="warning-text">Estos horarios no están disponibles para reservar</p>
              </div>
            )}

            {date && busyTimes.length === 0 && occupiedSlots.length > 0 && (
              <div className="available-times-info">
                <div className="info-header">
                  <span className="info-icon">✅</span>
                  <strong>¡Todos los horarios disponibles para el {formatSpanishDate(date)}!</strong>
                </div>
                <p className="info-text">Puedes seleccionar cualquier horario para este día.</p>
              </div>
            )}

            {error && (
              <div className={`error-message ${error.includes('no está disponible') ? 'warning-message' : ''}`}>
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <strong>{error.includes('no está disponible') ? 'Horario no disponible:' : 'Error:'}</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="reservation-summary">
              <div className="summary-item">
                <span>Cancha:</span>
                <strong>#{pitch.id} - {pitch.business?.businessName || 'Negocio'}</strong>
              </div>
              <div className="summary-item">
                <span>Precio por hora:</span>
                <strong>${pitch.price}</strong>
              </div>
              {pitch.business?.openingAt && pitch.business?.closingAt && (
                <div className="summary-item">
                  <span>Horario negocio:</span>
                  <strong>{pitch.business.openingAt} - {pitch.business.closingAt}</strong>
                </div>
              )}
              {date && selectedTime && (
                <>
                  <div className="summary-item">
                    <span>Fecha seleccionada:</span>
                    <strong>{formatSpanishDate(date)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Horario seleccionado:</span>
                    <strong>{timeSlots.find(slot => slot.time === selectedTime)?.label}</strong>
                  </div>
                  <div className="summary-item availability-status">
                    <span>Disponibilidad:</span>
                    <strong className="available">
                      ✅ Disponible
                    </strong>
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/reserve-pitch')} 
                className="btn btn-secondary"
                disabled={submitting}
              >
                ← Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !date || !selectedTime || !isTimeSlotAvailable(date, selectedTime)}
              >
                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <span className="button-icon">✅</span>
                    Confirmar Reserva - ${pitch.price}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}