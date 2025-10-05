import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../../../static/css/users/usersGetAll.css';
import DeleteConfirm from '../../../components/DeleteConfirm';
import Toast from '../../../components/Toast'; // Ajusta la ruta según tu estructura

interface Locality {
  id?: number;
  name: string;
  postal_code: number;
  province: string;
}

const LocalitiesGetAll = () => {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal de confirmación
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    localityId: null as number | null,
    localityName: '',
    isLoading: false
  });

  // Estados para el Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch('http://localhost:3000/api/localities/getAll', {
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
        
        let localityData: Locality[] = [];
        
        if (Array.isArray(responseData)) {
          localityData = responseData;
        } else if (responseData.localities && Array.isArray(responseData.localities)) {
          localityData = responseData.localities;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          localityData = responseData.data;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
        
        setLocalities(localityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar localidades');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalities();
  }, []);

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Función para ocultar toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Función para abrir el modal de confirmación
  const handleDeleteClick = (localityId: number, localityName: string) => {
    setDeleteModal({
      isOpen: true,
      localityId,
      localityName,
      isLoading: false
    });
  };

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      localityId: null,
      localityName: '',
      isLoading: false
    });
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = async () => {
    if (!deleteModal.localityId) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));

      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      const response = await fetch(`http://localhost:3000/api/localities/remove/${deleteModal.localityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar localidad');
      }

      // Eliminar la localidad del estado
      setLocalities(localities.filter(locality => locality.id !== deleteModal.localityId));
      
      // Cerrar el modal
      setDeleteModal({
        isOpen: false,
        localityId: null,
        localityName: '',
        isLoading: false
      });

      // Mostrar toast de éxito
      showToast('Localidad eliminada con éxito', 'success');
      
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
      // Mostrar toast de error
      showToast('Error al eliminar localidad: ' + (err instanceof Error ? err.message : 'Error desconocido'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Localidades</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando localidades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Localidades</h2>
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
    <div className="users-getall-container">
      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Localidad"
        message="¿Estás seguro de que quieres eliminar esta localidad?"
        itemName={deleteModal.localityName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Localidad"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="users-container">
        <h2 className="users-title">Lista de Localidades</h2>
        
        {!Array.isArray(localities) || localities.length === 0 ? (
          <p className="no-users-message">No hay localidades disponibles.</p>
        ) : (
          <div>
            <p className="users-summary">
              Total de localidades: <strong>{localities.length}</strong>
            </p>
            
            <div className="table-container">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Código Postal</th>
                    <th>Provincia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {localities.map((locality, index) => (
                    <tr key={locality.id || index} className="table-row">
                      <td className="table-cell">{locality.id || 'N/A'}</td>
                      <td className="table-cell">{locality.name}</td>
                      <td className="table-cell">{locality.postal_code}</td>
                      <td className="table-cell">{locality.province}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/localities/getOne/${locality.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/localities/update/${locality.id}`} 
                            className="action-button edit-button"
                            title="Editar localidad"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => locality.id && handleDeleteClick(locality.id, locality.name)} 
                            className="action-button delete-button"
                            title="Eliminar localidad"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalitiesGetAll;