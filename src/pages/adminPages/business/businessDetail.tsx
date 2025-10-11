import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/categories/categoryDetail.css';

interface Business {
  id: number;
  businessName: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  activatedAt?: Date;
  openingAt: string;
  closingAt: string;
  locality: number | { id: number; name: string };
  owner: number | { id: number; name: string; email: string };
}

interface Locality {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar localidades
  const fetchLocalities = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/localities/getAll', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const localitiesData = await response.json();
        const localitiesArray = Array.isArray(localitiesData) ? localitiesData : 
                              localitiesData.data || localitiesData.localities || [];
        setLocalities(localitiesArray);
      }
    } catch (err) {
      console.error('Error cargando localidades:', err);
    }
  };

  // Cargar usuarios
  const fetchOwners = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/users/findAll', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const ownersData = await response.json();
        const ownersArray = Array.isArray(ownersData) ? ownersData : 
                          ownersData.data || ownersData.users || [];
        setOwners(ownersArray);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  // Función para obtener el nombre de la localidad
  const getLocalityName = (locality: number | { id: number; name: string }): string => {
    if (typeof locality === 'object' && locality !== null) {
      return locality.name;
    } else if (typeof locality === 'number') {
      const foundLocality = localities.find(l => l.id === locality);
      return foundLocality?.name || `ID: ${locality}`;
    }
    return 'N/A';
  };

  // Función para obtener el nombre del dueño
  const getOwnerName = (owner: number | { id: number; name: string; email: string }): string => {
    if (typeof owner === 'object' && owner !== null) {
      return owner.name || owner.email || 'N/A';
    } else if (typeof owner === 'number') {
      const foundOwner = owners.find(o => o.id === owner);
      return foundOwner?.name || foundOwner?.email || `ID: ${owner}`;
    }
    return 'N/A';
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        // Cargar datos en paralelo
        await Promise.all([
          fetchBusinessData(token),
          fetchLocalities(token),
          fetchOwners(token)
        ]);
        
      } catch (err) {
        console.error('Error in fetchBusiness:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar negocio');
      } finally {
        setLoading(false);
      }
    };

    const fetchBusinessData = async (token: string) => {
      const url = `http://localhost:3000/api/business/findOne/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Negocio no encontrado');
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      const businessData = responseData.data || responseData;
      console.log('Business data extracted:', businessData);
      
      setBusiness(businessData);
    };

    if (id) {
      fetchBusiness();
    } else {
      setError('No se proporcionó ID de negocio');
      setLoading(false);
    }
  }, [id]);

  // Función para formatear el porcentaje de depósito
  const formatDepositPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(1)}%`;
  };

  // Función para formatear la fecha
  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'No activado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <p className="loading-text">Cargando información del negocio...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/business/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <h2 className="detail-title">🏢 Detalle del Negocio</h2>
      
      <div className="detail-card">
        <div className="business-header">
          <h3 className="business-name">{business.businessName}</h3>
          <span className={`status-badge ${business.active ? 'status-active' : 'status-inactive'}`}>
            {business.active ? '🟢 Activo' : '🔴 Inactivo'}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{business.id}</span>
          </div>
          
          <div className="detail-item">
            <label>Nombre del Negocio:</label>
            <span className="business-name-text">{business.businessName}</span>
          </div>
          
          <div className="detail-item">
            <label>Dirección:</label>
            <span className="address-text">{business.address}</span>
          </div>
          
          <div className="detail-item">
            <label>Localidad:</label>
            <span className="locality-badge">{getLocalityName(business.locality)}</span>
          </div>
          
          <div className="detail-item">
            <label>Dueño:</label>
            <span className="owner-badge">{getOwnerName(business.owner)}</span>
          </div>
          
          <div className="detail-item">
            <label>Rating Promedio:</label>
            <span className="rating-text">{business.averageRating?.toFixed(1) || '0.0'} ⭐</span>
          </div>
          
          <div className="detail-item">
            <label>Depósito de Reserva:</label>
            <span className="deposit-text">{formatDepositPercentage(business.reservationDepositPercentage)}</span>
          </div>
          
          <div className="detail-item">
            <label>Horario de Atención:</label>
            <span className="schedule-text">{business.openingAt} - {business.closingAt}</span>
          </div>
          
          <div className="detail-item">
            <label>Estado:</label>
            <span className={`status-text ${business.active ? 'status-active' : 'status-inactive'}`}>
              {business.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          <div className="detail-item">
            <label>Fecha de Activación:</label>
            <span className="date-text">{formatDate(business.activatedAt)}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="additional-info">
          <h4>📊 Información Adicional</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Horario Comercial:</span>
              <span className="info-value">{business.openingAt} a {business.closingAt}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Política de Depósito:</span>
              <span className="info-value">{formatDepositPercentage(business.reservationDepositPercentage)} por reserva</span>
            </div>
            <div className="info-item">
              <span className="info-label">Satisfacción de Clientes:</span>
              <span className="info-value">{business.averageRating?.toFixed(1) || '0.0'} / 5.0 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/business/getAll')}
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/businesses/update/${business.id}`}
          className="edit-button"
        >
          ✏️ Editar Negocio
        </Link>
        <button 
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar este negocio? Esta acción no se puede deshacer.')) {
              console.log('Eliminar negocio:', business.id);
              // Aquí iría la lógica para eliminar el negocio
            }
          }}
          className="delete-button"
        >
          🗑️ Eliminar Negocio
        </button>
      </div>
    </div>
  );
};

export default BusinessDetail;