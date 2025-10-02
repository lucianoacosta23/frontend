import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../../static/css/categories/categoryUpdate.css';

interface Category {
  id: number;
  description: string;
  usertype: string;
}

const CategoryUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    description: '',
    usertype: ''
  });

  // Cargar categoría
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`http://localhost:3000/api/category/getOne/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar categoría');
        }

        const categoryData = await response.json();
        const category = categoryData.data || categoryData;
        
        console.log('🎯 DATOS DE LA CATEGORÍA RECIBIDOS:', category);
        setCategory(category);

        // Establecer form data con los datos actuales
        setFormData({
          description: category.description || '',
          usertype: category.usertype || ''
        });

      } catch (err) {
        console.error('🎯 ERROR EN FETCH:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Datos para enviar
      const updateData = {
        description: formData.description.trim(),
        usertype: formData.usertype.trim()
      };

      console.log('🎯 Datos a enviar al backend:', updateData);

      const response = await fetch(`http://localhost:3000/api/category/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      alert('Categoría actualizada con éxito');
      navigate(`/admin/categories/detail/${id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/categories/detail/${id}`);
  };

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="loading-message">
          <p>Cargando datos de la categoría...</p>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/categories/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        ✏️ Actualizar Categoría: {category?.description}
      </h2>
      
      {/* Mostrar información actual */}
      {category && (
        <div className="category-subtitle">
          <span className="current-category-subtitle">
            📋 Tipo actual: <strong>{category.usertype}</strong>
          </span>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Información actual de la categoría */}
      {category && (
        <div className="current-category-info">
          <h3>📊 Información Actual de la Categoría</h3>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{category.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Descripción:</span>
              <span className="info-value">{category.description}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo de Usuario:</span>
              <span className="info-value category-highlight">
                {category.usertype}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la descripción de la categoría"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="usertype">Tipo de Usuario</label>
            
            {/* 🎯 Mostrar tipo actual si existe */}
            {category?.usertype && (
              <div className="current-category">
                <span>📋 Tipo actual: <strong>{category.usertype}</strong></span>
              </div>
            )}
            
            <input
              type="text"
              id="usertype"
              name="usertype"
              value={formData.usertype}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: admin, user, manager, employee, etc."
            />
            
            <small className="form-help">
              {formData.usertype ? (
                <span className="input-valid">
                  ✓ Tipo ingresado: <strong>{formData.usertype}</strong>
                </span>
              ) : (
                <span className="input-help">
                  Ingrese el tipo de usuario para esta categoría (texto libre)
                </span>
              )}
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={saving || !formData.description.trim() || !formData.usertype.trim()}
          >
            {saving ? 'Actualizando...' : 'Actualizar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryUpdate;