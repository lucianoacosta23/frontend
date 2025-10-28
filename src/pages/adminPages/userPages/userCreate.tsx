import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../static/css/users/userCreate.css'; // Cambiar import

interface Category {
  id: number;
  name: string;
  usertype?: string;
}

const UserCreate = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario - con valores iniciales vacíos
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    categoryId: '',
    password: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        // Obtener categorías
        const categoriesResponse = await fetch('http://localhost:3000/api/category/getAll', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (categoriesResponse.ok) {
          const categoriesResponseData = await categoriesResponse.json();
          const categoriesData = categoriesResponseData.data || categoriesResponseData;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
          setCategories([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!formData.surname.trim()) {
        throw new Error('El apellido es obligatorio');
      }
      
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }

      if (!formData.password.trim()) {
        throw new Error('La contraseña es obligatoria');
      }

      if (formData.password.trim().length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Preparar datos para enviar
      const createData: any = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
      };

      if(createData.phoneNumber === null) {
        delete createData.phoneNumber;
      }
      // Incluir categoryId solo si se seleccionó una categoría válida
      if (formData.categoryId && !isNaN(parseInt(formData.categoryId))) {
        createData.category = parseInt(formData.categoryId);
      }
      console.log('Datos a enviar para crear usuario:', createData);
      const response = await fetch('http://localhost:3000/api/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createData)
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

      alert('Usuario creado con éxito');
      navigate('/admin/users/getAll');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
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
        <h2 className="update-title">Crear Nuevo Usuario</h2>
        <div className="loading-message">
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">Crear Nuevo Usuario</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
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
            <label htmlFor="surname">Apellido</label>
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
            <label htmlFor="email">Email</label>
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
          <div className="form-group">
            <label htmlFor="categoryId">Categoría</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Seleccione una categoría (opcional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.usertype || category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <small className="form-help">
                Las categorías no están disponibles, se puede crear el usuario sin categoría
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la contraseña"
              minLength={6}
            />
            <small className="form-help">Mínimo 6 caracteres</small>
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
            {saving ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;