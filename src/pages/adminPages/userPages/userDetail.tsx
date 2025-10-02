import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/users/userDetail.css';

interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  categoryName?: string; // Cambiado para coincidir con el backend
  category?: {
    id: number;
    name?: string;
    usertype?: string; // Agregado usertype
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  description: string;
  usertype: string;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const url = `http://localhost:3000/api/users/findOne/${id}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Usuario no encontrado');
          }
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Response data:', responseData); // Debug log
        
        // El backend puede devolver los datos directamente o dentro de 'data'
        const userData = responseData.data || responseData;
        console.log('User data extracted:', userData); // Debug log
        
        setUser(userData);
      } catch (err) {
        console.error('Error in fetchUser:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch('http://localhost:3000/api/category/getAll', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    if (id) {
      fetchUser();
      fetchCategories();
    } else {
      setError('No se proporcionó ID de usuario');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <p className="loading-text">Cargando información del usuario...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/users/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  // Función para obtener el nombre de la categoría
  const getCategoryDisplay = () => {
    if (user.categoryName) {
      return user.categoryName;
    }
    if (user.category?.usertype) {
      return user.category.usertype;
    }
    if (user.category?.name) {
      return user.category.name;
    }
    if (user.category?.id) {
      return `ID: ${user.category.id}`;
    }
    return 'Sin categoría';
  };

  return (
    <div className="detail-container">
      <h2 className="detail-title">👤 Detalle del Usuario</h2>
      
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{user.id || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{user.name || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Apellido:</label>
            <span>{user.surname || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Email:</label>
            <span>{user.email || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Teléfono:</label>
            <span>{user.phoneNumber || 'No especificado'}</span>
          </div>
          
          <div className="detail-item">
            <label>Categoría:</label>
            <span>{getCategoryDisplay()}</span>
          </div>
          
          <div className="detail-item">
            <label>Fecha de Registro:</label>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Última Actualización:</label>
            <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Sin actualizaciones'}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/users/getAll')} 
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/users/update/${user.id}`} 
          className="edit-button"
        >
          ✏️ Editar Usuario
        </Link>
      </div>
    </div>
  );
};

export default UserDetail;