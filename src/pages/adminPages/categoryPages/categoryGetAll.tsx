import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';

interface Category {
  id?: number;
  description: string;
  usertype: string;
}

const CategoryGetAll = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch('http://localhost:3000/api/category/getAll', {
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
        
        let categoryData: Category[] = [];
        
        if (Array.isArray(responseData)) {
          categoryData = responseData;
        } else if (responseData.categories && Array.isArray(responseData.categories)) {
          categoryData = responseData.categories;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          categoryData = responseData.data;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
        
        setCategories(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  // 🎯 FUNCIÓN PARA MOSTRAR EL MODAL (reemplaza la confirmación antigua)
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // 🎯 FUNCIÓN PARA CONFIRMAR LA ELIMINACIÓN - MODIFICADA
  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !categoryToDelete.id) return;

    setIsDeleting(true);
    
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`http://localhost:3000/api/category/remove/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const responseText = await response.text();
        
        if (response.status === 404) {
          throw new Error('Categoría no encontrada');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar esta categoría');
        } else if (response.status === 409) {
          throw new Error('No se puede eliminar la categoría porque está siendo utilizada');
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

      // Actualizar la lista local removiendo la categoría eliminada
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryToDelete.id)
      );
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      // 🎯 MOSTRAR TOAST DE ÉXITO EN LUGAR DE ALERT
      showNotification(
        `Categoría "${categoryToDelete.description}" eliminada con éxito`, 
        'success'
      );
      
    } catch (err) {
      console.error('🎯 Error al eliminar categoría:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // 🎯 MOSTRAR TOAST DE ERROR EN LUGAR DE ALERT
      showNotification(
        `Error al eliminar categoría: ${errorMessage}`, 
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // 🎯 FUNCIÓN PARA CANCELAR LA ELIMINACIÓN
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if (loading) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Categorías</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Categorías</h2>
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
        <h2 className="categories-title">Lista de Categorías</h2>
        
        {!Array.isArray(categories) || categories.length === 0 ? (
          <div className="no-categories-message">
            <p>No hay categorías disponibles.</p>
          </div>
        ) : (
          <>
            <div className="categories-summary">
              Total de categorías: <strong>{categories.length}</strong>
            </div>
            
            <div className="table-container">
              <table className="categories-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Tipo de Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id || index} className="table-row">
                      <td className="table-cell">{category.id || 'N/A'}</td>
                      <td className="table-cell">{category.description}</td>
                      <td className="table-cell">{category.usertype}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/categories/detail/${category.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/categories/update/${category.id}`} 
                            className="action-button edit-button"
                            title="Editar categoría"
                          >
                            Editar
                          </Link>
                          {/* 🎯 BOTÓN MODIFICADO - Ahora abre el modal */}
                          <button 
                            onClick={() => handleDeleteClick(category)}
                            className="action-button delete-button"
                            title={`Eliminar categoría: ${category.description}`}
                            disabled={!category.id}
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
        title="Eliminar Categoría"
        message="¿Estás seguro de que quieres eliminar esta categoría? Esta acción afectará a todos los usuarios asociados."
        itemName={categoryToDelete ? `${categoryToDelete.description} (${categoryToDelete.usertype})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Categoría"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryGetAll;

