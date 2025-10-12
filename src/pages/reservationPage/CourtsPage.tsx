import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import CourtList from './CourtList';
import type { Court } from '../../components/CourtCard';
import '../../static/css/courtPages.css';

const CourtsPage: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoof, setFilterRoof] = useState<'all' | 'with' | 'without'>('all');
  const [filterGroundType, setFilterGroundType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [priceInputs, setPriceInputs] = useState<{ min: string; max: string }>({ min: '0', max: '10000' });
  
  const navigate = useNavigate();

  // 🎯 VERIFICACIÓN SIMPLE: Solo si está logueado o no
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert('sesion no iniciada');
    return <Navigate to="/login" />;
  }

  // 🎯 EXTRAER EL TOKEN CORRECTAMENTE
  let token = '';
  try {
    const userObject = JSON.parse(storedUser);
    token = userObject.token || storedUser;
  } catch (error) {
    // Si no es JSON válido, usar el string directo
    token = storedUser;
  }

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🎯 USAR EL TOKEN EXTRAÍDO
      const response = await fetch('http://localhost:3000/api/pitchs/getAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Usar el token extraído
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('user');
        alert('sesion expirada');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('🎯 Datos de canchas recibidos:', responseData);

      let courtsData: Court[] = [];
      if (Array.isArray(responseData)) {
        courtsData = responseData;
      } else if (responseData.courts && Array.isArray(responseData.courts)) {
        courtsData = responseData.courts;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        courtsData = responseData.data;
      } else {
        throw new Error('Formato de respuesta inesperado');
      }

      setCourts(courtsData);
      
      if (courtsData.length > 0) {
        const maxPrice = Math.max(...courtsData.map(court => court.price));
        const adjustedMax = Math.ceil(maxPrice * 1.1);
        setPriceRange(prev => ({ ...prev, max: adjustedMax }));
        setPriceInputs(prev => ({ ...prev, max: adjustedMax.toString() }));
      }
    } catch (err) {
      console.error('🎯 Error al obtener canchas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar canchas');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveCourt = (courtId: number) => {
    console.log('🎯 Reservar cancha con ID:', courtId);
    alert(`Funcionalidad de reserva para cancha ${courtId} - Próximamente`);
  };

  const handleMinPriceChange = (value: string) => {
    setPriceInputs(prev => ({ ...prev, min: value }));
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPriceRange(prev => ({ 
        ...prev, 
        min: numValue,
        max: prev.max < numValue ? numValue : prev.max
      }));
    } else if (value === '' || value === '0') {
      setPriceRange(prev => ({ ...prev, min: 0 }));
    }
  };

  const handleMaxPriceChange = (value: string) => {
    setPriceInputs(prev => ({ ...prev, max: value }));
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPriceRange(prev => ({ 
        ...prev, 
        max: numValue,
        min: prev.min > numValue ? numValue : prev.min
      }));
    } else if (value === '') {
      setPriceRange(prev => ({ ...prev, max: 999999 }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRoof('all');
    setFilterGroundType('all');
    
    const defaultMin = 0;
    const defaultMax = courts.length > 0 
      ? Math.ceil(Math.max(...courts.map(court => court.price)) * 1.1)
      : 10000;
    
    setPriceRange({ min: defaultMin, max: defaultMax });
    setPriceInputs({ min: defaultMin.toString(), max: defaultMax.toString() });
  };

  // Filtrar canchas
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.groundType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoof = filterRoof === 'all' || 
                       (filterRoof === 'with' && court.roof) || 
                       (filterRoof === 'without' && !court.roof);
    
    const matchesGround = filterGroundType === 'all' || court.groundType === filterGroundType;
    const matchesPrice = court.price >= priceRange.min && court.price <= priceRange.max;

    return matchesSearch && matchesRoof && matchesGround && matchesPrice;
  });

  const uniqueGroundTypes = [...new Set(courts.map(court => court.groundType))];

  if (loading) {
    return (
      <div className="courts-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando canchas disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courts-page-container">
        <div className="error-container">
          <div className="error-message">
            <h3>❌ Error al cargar canchas</h3>
            <p>{error}</p>
          </div>
          <button onClick={fetchCourts} className="retry-button">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courts-page-container">
      <div className="courts-header-section">
        <h1 className="courts-main-title">🏟️ Canchas Disponibles</h1>
        <p className="courts-main-subtitle">
          Encuentra la cancha perfecta para tu próximo partido
        </p>
        
        <div className="courts-summary-stats">
          <span className="courts-total-count">
            📊 Total: <strong>{courts.length}</strong> canchas
          </span>
          <span className="courts-filtered-count">
            🔍 Mostrando: <strong>{filteredCourts.length}</strong> canchas
          </span>
        </div>
      </div>

      <div className="courts-list-main">
        <CourtList 
          courts={filteredCourts} 
          onReserveCourt={handleReserveCourt}
        />
      </div>

      <div className="courts-filters-sidebar">
        <div className="courts-filters-header">
          <h3 className="courts-filters-title">🔍 Filtros de búsqueda</h3>
        </div>
        
        <div className="courts-filters-grid">
          <div className="courts-filter-group">
            <label htmlFor="search" className="courts-filter-label">Buscar:</label>
            <input
              type="text"
              id="search"
              placeholder="Nombre del negocio, dirección, tipo de suelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="courts-filter-input"
            />
          </div>

          <div className="courts-filter-group">
            <label htmlFor="roof" className="courts-filter-label">Techo:</label>
            <select
              id="roof"
              value={filterRoof}
              onChange={(e) => setFilterRoof(e.target.value as 'all' | 'with' | 'without')}
              className="courts-filter-select"
            >
              <option value="all">Todas</option>
              <option value="with">Con techo</option>
              <option value="without">Sin techo</option>
            </select>
          </div>

          <div className="courts-filter-group">
            <label htmlFor="groundType" className="courts-filter-label">Tipo de suelo:</label>
            <select
              id="groundType"
              value={filterGroundType}
              onChange={(e) => setFilterGroundType(e.target.value)}
              className="courts-filter-select"
            >
              <option value="all">Todos los tipos</option>
              {uniqueGroundTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="courts-filter-group courts-price-filter-group">
            <label className="courts-filter-label">Rango de precio:</label>
            <div className="courts-price-inputs">
              <input
                type="number"
                placeholder="Mín"
                value={priceInputs.min}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="courts-filter-input courts-price-input"
                min="0"
                step="100"
              />
              <span className="courts-price-separator">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={priceInputs.max}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="courts-filter-input courts-price-input"
                min="0"
                step="100"
              />
            </div>
            <div className="courts-price-display">
              ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={handleClearFilters}
          className="courts-clear-filters-btn"
        >
          🧹 Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default CourtsPage;