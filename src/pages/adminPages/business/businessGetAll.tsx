import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';

interface Business {
  id?: number;
  businessName: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  activatedAt?: Date;
  openingAt: string;
  closingAt: string;
  locality: {
    id: number;
    name: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

const BusinessGetAll = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch('http://localhost:3000/api/business/findAll', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token de autenticación inválido o expirado');
          }
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        let businessData: Business[] = [];
        
        if (Array.isArray(responseData)) {
          businessData = responseData;
        } else if (responseData.businesses && Array.isArray(responseData.businesses)) {
          businessData = responseData.businesses;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          businessData = responseData.data;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
        
        setBusinesses(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar negocios');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  // 🎯 FUNCIÓN PARA MOSTRAR EL MODAL (reemplaza la confirmación antigua)
  const handleDeleteClick = (business: Business) => {
    setBusinessToDelete(business);
    setShowDeleteModal(true);
  };

  // 🎯 FUNCIÓN PARA CONFIRMAR LA ELIMINACIÓN - MODIFICADA
  const handleConfirmDelete = async () => {
    if (!businessToDelete || !businessToDelete.id) return;

    setIsDeleting(true);
    
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`http://localhost:3000/api/business/remove/${businessToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const responseText = await response.text();
        
        if (response.status === 404) {
          throw new Error('Negocio no encontrado');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar este negocio');
        } else if (response.status === 409) {
          throw new Error('No se puede eliminar el negocio porque tiene canchas asociadas');
        } else {
          let errorMessage = `Error: ${response.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
      }

      // Actualizar la lista local removiendo el negocio eliminado
      setBusinesses(prevBusinesses => 
        prevBusinesses.filter(business => business.id !== businessToDelete.id)
      );
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setBusinessToDelete(null);
      
      // 🎯 MOSTRAR TOAST DE ÉXITO EN LUGAR DE ALERT
      showNotification(
        `Negocio "${businessToDelete.businessName}" eliminado con éxito`, 
        'success'
      );
      
    } catch (err) {
      console.error('🎯 Error al eliminar negocio:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // 🎯 MOSTRAR TOAST DE ERROR EN LUGAR DE ALERT
      showNotification(
        `Error al eliminar negocio: ${errorMessage}`, 
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // 🎯 FUNCIÓN PARA CANCELAR LA ELIMINACIÓN
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBusinessToDelete(null);
  };

  // Función para formatear el estado activo/inactivo
  const formatActiveStatus = (active: boolean) => {
    return active ? (
      <span className="status-active">Activo</span>
    ) : (
      <span className="status-inactive">Inactivo</span>
    );
  };

  // Función para formatear porcentaje
  const formatPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Negocios</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando negocios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Negocios</h2>
          <div className="error-container">
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
            <button onClick={handleRetry} className="retry-button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-getall-container">
      <div className="categories-container">
        <h2 className="categories-title">Lista de Negocios</h2>
        
        {!Array.isArray(businesses) || businesses.length === 0 ? (
          <div className="no-categories-message">
            <p>No hay negocios disponibles.</p>
          </div>
        ) : (
          <>
            <div className="categories-summary">
              Total de negocios: <strong>{businesses.length}</strong>
            </div>
            
            <div className="table-container">
              <table className="categories-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Negocio</th>
                    <th>Dirección</th>
                    <th>Localidad</th>
                    <th>Dueño</th>
                    <th>Rating</th>
                    <th>Depósito</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business, index) => (
                    <tr key={business.id || index} className="table-row">
                      <td className="table-cell">{business.id || 'N/A'}</td>
                      <td className="table-cell">{business.businessName}</td>
                      <td className="table-cell">{business.address}</td>
                      <td className="table-cell">{business.locality?.name || 'N/A'}</td>
                      <td className="table-cell">
                        {business.owner?.name || business.owner?.email || 'N/A'}
                      </td>
                      <td className="table-cell">{business.averageRating?.toFixed(1) || '0.0'}</td>
                      <td className="table-cell">{formatPercentage(business.reservationDepositPercentage)}</td>
                      <td className="table-cell">{business.openingAt} - {business.closingAt}</td>
                      <td className="table-cell">{formatActiveStatus(business.active)}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/businesses/detail/${business.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/businesses/update/${business.id}`} 
                            className="action-button edit-button"
                            title="Editar negocio"
                          >
                            Editar
                          </Link>
                          {/* 🎯 BOTÓN MODIFICADO - Ahora abre el modal */}
                          <button 
                            onClick={() => handleDeleteClick(business)}
                            className="action-button delete-button"
                            title={`Eliminar negocio: ${business.businessName}`}
                            disabled={!business.id}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 🎯 MODAL DE CONFIRMACIÓN */}
      <DeleteConfirm
        isOpen={showDeleteModal}
        title="Eliminar Negocio"
        message="¿Estás seguro de que quieres eliminar este negocio? Esta acción afectará a todas las canchas asociadas y no se puede deshacer."
        itemName={businessToDelete ? `${businessToDelete.businessName} (${businessToDelete.locality?.name})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Negocio"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BusinessGetAll;