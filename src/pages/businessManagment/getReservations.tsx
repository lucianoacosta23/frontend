import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, Navigate } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import '../../static/css/MybusinessReservations.css';

// Interfaces TypeScript
interface Reservation {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'attended';
  totalPrice?: number;
  pitchId?: number;
  userId?: number;
  pitch?: {
    id: number;
    name: string;
    size: string;
    groundType: string;
    price?: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

interface ReservationResponse {
  data: Reservation[];
}

type FilterType = 'all' | 'today' | 'pending' | 'confirmed' | 'attended' | 'cancelled';

export default function BusinessReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [updatingReservation, setUpdatingReservation] = useState<number | null>(null);

  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  // 🎯 VERIFICACIÓN DE SESIÓN
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert('sesion no iniciada');
    return <Navigate to="/login" />;
  }

  // 🎯 FUNCIÓN para obtener token y userId
  const getAuthData = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No se encontró información de usuario');
      }

      let token: string;
      let userId: number | null = null;

      try {
        const userObject = JSON.parse(userStr);
        token = userObject.token || userStr;
        userId = userObject.id;
      } catch {
        token = userStr;
      }

      if (!userId && token) {
        try {
          const payload = token.split('.')[1];
          if (payload) {
            const decoded = JSON.parse(atob(payload));
            userId = decoded.id || decoded.userId || decoded.sub;
          }
        } catch (decodeError) {
          console.error('Error decodificando token:', decodeError);
        }
      }

      return { token, userId };
    } catch (error) {
      console.error('Error obteniendo datos de auth:', error);
      throw error;
    }
  }, []);

  // 🎯 FUNCIÓN para obtener el businessId del usuario
  const getBusinessId = useCallback(async () => {
    try {
      const { token, userId } = getAuthData();
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const response = await fetch(`http://localhost:3000/api/business/findByOwnerId/${userId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user');
        alert('Sesión expirada o inválida');
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 404) {
        setHasNoBusiness(true);
        setLoading(false);
        showNotification('No tienes un negocio registrado aún', 'warning');
        return null;
      }
      
      if (!response.ok) {
        const errors = await response.json();
        throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener el negocio'}`);
      }
      
      const businessData = await response.json();
      
      let extractedBusinessId;
      if (businessData.id) {
        extractedBusinessId = businessData.id;
      } else if (businessData.data && businessData.data.id) {
        extractedBusinessId = businessData.data.id;
      } else if (Array.isArray(businessData) && businessData.length > 0) {
        extractedBusinessId = businessData[0].id;
      } else if (Array.isArray(businessData.data) && businessData.data.length > 0) {
        extractedBusinessId = businessData.data[0].id;
      }
      
      if (!extractedBusinessId) {
        setHasNoBusiness(true);
        setLoading(false);
        showNotification('No se encontró información válida del negocio', 'warning');
        return null;
      }
      
      setBusinessId(extractedBusinessId);
      setHasNoBusiness(false);
      return extractedBusinessId;
      
    } catch (error) {
      console.error('🎯 Error getting business ID:', error);
      showNotification(errorHandler(error), 'error');
      setError(true);
      throw error;
    }
  }, [getAuthData, showNotification]);

  // 🎯 FUNCIÓN para obtener todas las reservaciones del negocio
  const getReservations = useCallback(async (currentBusinessId?: number) => {
    try {
      setLoading(true);
      setError(false);
      
      let targetBusinessId = currentBusinessId || businessId;
      if (!targetBusinessId) {
        targetBusinessId = await getBusinessId();
        if (!targetBusinessId) {
          return;
        }
      }

      const { token } = getAuthData();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`http://localhost:3000/api/reservations/findByBusiness/${targetBusinessId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user');
        alert('Sesión expirada o inválida');
        window.location.href = '/login';
        return;
      }

      if (response.status === 404) {
        setReservations([]);
        showNotification('No tienes reservaciones registradas aún', 'info');
        return;
      }
      
      if (!response.ok) {
        const errors = await response.json();
        
        if (errors.error && errors.error.includes('No reservations found')) {
          setReservations([]);
          showNotification('No tienes reservaciones registradas aún', 'info');
          return;
        }
        
        throw new Error(`Error ${response.status}: ${errors.message || errors.error || 'Error al obtener las reservaciones'}`);
      }
      
      const json: ReservationResponse = await response.json();
      setReservations(json.data || []);
      
    } catch (error) {
      console.error('🎯 Error getting reservations:', error);
      showNotification(errorHandler(error), 'error');
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [businessId, getBusinessId, getAuthData, showNotification]);

  // 🎯 FUNCIÓN PARA APLICAR FILTROS
  const applyFilters = useCallback((reservationsList: Reservation[], filter: FilterType) => {
    const today = new Date().toDateString();
    
    switch (filter) {
      case 'today':
        return reservationsList.filter(res => 
          new Date(res.ReservationDate).toDateString() === today
        );
      case 'pending':
        return reservationsList.filter(res => res.status === 'pending');
      case 'confirmed':
        return reservationsList.filter(res => res.status === 'confirmed');
      case 'attended':
        return reservationsList.filter(res => res.status === 'attended');
      case 'cancelled':
        return reservationsList.filter(res => res.status === 'cancelled');
      default:
        return reservationsList;
    }
  }, []);

  // 🎯 EFECTO PARA FILTRAR RESERVACIONES
  useEffect(() => {
    if (reservations.length > 0) {
      const filtered = applyFilters(reservations, activeFilter);
      setFilteredReservations(filtered);
    }
  }, [reservations, activeFilter, applyFilters]);

  // 🎯 FUNCIÓN PARA REINICIALIZAR
  const initializeData = useCallback(async () => {
    try {
      setError(false);
      setHasNoBusiness(false);
      const { token } = getAuthData();
      if (!token) {
        showNotification('Usuario no autenticado', 'error');
        setError(true);
        setLoading(false);
        return;
      }

      const currentBusinessId = await getBusinessId();
      if (currentBusinessId) {
        await getReservations(currentBusinessId);
      }
    } catch (error) {
      console.error('🎯 Error inicializando datos:', error);
      setError(true);
      setLoading(false);
    }
  }, [getAuthData, getBusinessId, getReservations, showNotification]);

  useEffect(() => {
    initializeData();
  }, []);

  // 🎯 FUNCIÓN PARA MARCAR COMO ASISTIDO
  const markAsAttended = async (reservationId: number) => {
    try {
      setUpdatingReservation(reservationId);
      const { token } = getAuthData();
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`http://localhost:3000/api/reservations/${reservationId}/status`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'attended'
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user');
        alert('Sesión expirada o inválida');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errors = await response.json();
        throw new Error(`Error ${response.status}: ${errors.message || 'Error al actualizar la reservación'}`);
      }
      
      showNotification('Reservación marcada como asistida!', 'success');
      
      // Actualizar el estado local
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, status: 'attended' } : res
      ));
      
    } catch (error) {
      console.error('🎯 Error marcando como asistido:', error);
      showNotification(errorHandler(error), 'error');
    } finally {
      setUpdatingReservation(null);
    }
  };

  // 🎯 FUNCIÓN PARA EXTRAER LA FECHA
  const extractDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 🎯 FUNCIÓN PARA EXTRAER LA HORA
  const extractTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🎯 FUNCIÓN PARA OBTENER COLOR DEL ESTADO
  const getStatusColor = (status: string = 'pending') => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      case 'attended':
        return 'status-attended';
      default:
        return 'status-pending';
    }
  };

  // 🎯 FUNCIÓN PARA OBTENER TEXTO DEL ESTADO
  const getStatusText = (status: string = 'pending') => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      case 'attended':
        return 'Asistida';
      default:
        return 'Pendiente';
    }
  };

  // 🎯 FUNCIÓN PARA CALCULAR ESTADÍSTICAS
  const getStats = () => {
    const today = new Date().toDateString();
    return {
      total: reservations.length,
      today: reservations.filter(res => 
        new Date(res.ReservationDate).toDateString() === today
      ).length,
      pending: reservations.filter(res => res.status === 'pending').length,
      confirmed: reservations.filter(res => res.status === 'confirmed').length,
      attended: reservations.filter(res => res.status === 'attended').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando reservaciones del negocio...</p>
      </div>
    );
  }

  if (hasNoBusiness) {
    return (
      <div className="no-business-container">
        <h3>🏢 No tienes un negocio registrado</h3>
        <p>Para ver las reservaciones, primero debes registrar tu negocio.</p>
        <div className="action-buttons">
          <button 
            onClick={() => window.location.href = '/registerBusiness'} 
            className="primary-button"
          >
            📝 Registrar mi negocio
          </button>
          <button onClick={initializeData} className="secondary-button">
            🔄 Verificar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error al cargar las reservaciones del negocio</p>
        <button onClick={initializeData} className="retry-button">
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h2>📋 Reservaciones del Negocio</h2>
        <div className="reservations-summary">
          <strong>Total: {stats.total} reservaciones</strong>
          <span> | Negocio ID: {businessId}</span>
        </div>
      </div>

      {/* 🎯 FILTROS */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtros</h3>
          <div className="active-filter-info">
            Mostrando: {filteredReservations.length} de {reservations.length}
          </div>
        </div>
        <div className="filters-grid">
          <button 
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            📋 Todas ({stats.total})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            📅 Hoy ({stats.today})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            ⏳ Pendientes ({stats.pending})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('confirmed')}
          >
            ✅ Confirmadas ({stats.confirmed})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'attended' ? 'active' : ''}`}
            onClick={() => setActiveFilter('attended')}
          >
            👍 Asistidas ({stats.attended})
          </button>
        </div>
      </div>
      
      {/* 🎯 TABLA */}
      <div className="table-container">
        {filteredReservations.length === 0 ? (
          <div className="no-reservations-message">
            <p>No hay reservaciones que coincidan con el filtro seleccionado</p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="secondary-button"
            >
              Ver todas las reservaciones
            </button>
          </div>
        ) : (
          <table className='reservations-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cancha</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="reservation-id">#{reservation.id}</td>
                  <td>
                    <div className="pitch-info">
                      <strong>{reservation.pitch?.name || `Cancha ${reservation.pitchId || 'N/A'}`}</strong>
                      {reservation.pitch?.size && (
                        <small>{reservation.pitch.size} - {reservation.pitch.groundType}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      {extractDate(reservation.ReservationDate)}
                    </div>
                  </td>
                  <td>
                    <div className="time-info">
                      {extractTime(reservation.ReservationTime)}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{reservation.user?.name || 'Cliente'}</strong>
                      {reservation.user?.phone && (
                        <small>📞 {reservation.user.phone}</small>
                      )}
                      {reservation.user?.email && (
                        <small>✉️ {reservation.user.email}</small>
                      )}
                    </div>
                  </td>
                  <td className="price">
                    ${reservation.totalPrice || reservation.pitch?.price || '0'}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                        <button 
                          className={`action-button attend ${updatingReservation === reservation.id ? 'loading' : ''}`}
                          onClick={() => markAsAttended(reservation.id)}
                          disabled={updatingReservation === reservation.id}
                          title="Marcar como asistido"
                        >
                          {updatingReservation === reservation.id ? '⏳' : '👍'} Asistido
                        </button>
                      )}
                      {reservation.status === 'attended' && (
                        <span className="attended-badge">✅ Asistió</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="reservations-footer">
        <div className="reservations-stats">
          <span>Reservaciones hoy: {stats.today}</span>
          <span> | Pendientes: {stats.pending}</span>
        </div>
        <button onClick={initializeData} className="refresh-button">
          🔄 Actualizar lista
        </button>
      </div>
    </div>
  );
}