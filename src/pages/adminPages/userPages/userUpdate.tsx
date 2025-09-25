import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../../static/css/userUpdate.css';

interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string | null;
  password?: string;
  categoryName?: string;
  category?: {
    id: number;
    name: string;
    usertype?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  name: string;
  usertype?: string;
}

const UserUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    categoryId: '',
    password: ''
  });

  useEffect(() => {
    const fetchUserAndCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        // Obtener usuario
        const userResponse = await fetch(`http://localhost:3000/api/users/findOne/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Error al cargar usuario: ${userResponse.status}`);
        }

        const userResponseData = await userResponse.json();
        const userData = userResponseData.data || userResponseData;

        // Intentar obtener categorías
        let categoriesData = [];
        try {
          const categoriesResponse = await fetch('http://localhost:3000/api/categories/findAll', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (categoriesResponse.ok) {
            const categoriesResponseData = await categoriesResponse.json();
            categoriesData = categoriesResponseData.data || categoriesResponseData;
          }
        } catch (categoriesError) {
          // Continuar sin categorías si hay error
        }

        setUser(userData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Rellenar el formulario con los datos del usuario
        const initialFormData = {
          name: userData.name || '',
          surname: userData.surname || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          categoryId: userData.category?.id?.toString() || '',
          password: ''
        };

        setFormData(initialFormData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserAndCategories();
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

      // Preparar datos para enviar
      const updateData: any = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
      };

      // Solo incluir categoryId si hay una seleccionada y es válida
      if (formData.categoryId && !isNaN(parseInt(formData.categoryId))) {
        updateData.categoryId = parseInt(formData.categoryId);
      }

      // Solo incluir password si se proporcionó
      if (formData.password.trim()) {
        updateData.password = formData.password.trim();
      }

      const response = await fetch(`http://localhost:3000/api/users/update/${id}`, {
        method: 'PUT',
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

      alert('Usuario actualizado con éxito');
      navigate('/admin/users/getAll');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users/getAll');
  };

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Editar Usuario</h2>
        <div className="loading-message">
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="update-container">
        <h2 className="update-title">Editar Usuario</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
          <button onClick={() => navigate('/admin/users/getAll')} className="cancel-button">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">✏️ Editar Usuario</h2>
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="surname">Apellido *</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el apellido"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Teléfono</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ingrese el teléfono (opcional)"
            />
          </div>
        </div>

        <div className="form-row">
          {categories.length > 0 ? (
            <div className="form-group">
              <label htmlFor="categoryId">Categoría</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Mantener categoría actual</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.usertype || category.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Categoría Actual</label>
              <div className="current-category">
                {user?.categoryName || user?.category?.usertype || 'Sin categoría'}
              </div>
              <small className="form-help">
                No se pudieron cargar las categorías disponibles
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Dejar vacío para mantener la actual"
            />
            <small className="form-help">Dejar vacío para no cambiar la contraseña</small>
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
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;