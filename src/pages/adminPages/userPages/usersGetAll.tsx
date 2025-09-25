import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../../../static/css/usersGetAll.css';

interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  categoryName?: string; // Agregado categoryName
  category?: {
    id: number;
    name: string;
    usertype?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const UsersGetAll = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el token del objeto user almacenado en localStorage
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        const response = await fetch('http://localhost:3000/api/users/findAll', {
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
        console.log('Response data:', responseData); // Debug log
        
        // Verificar si la respuesta es un array o contiene un array
        let userData: User[] = [];
        
        if (Array.isArray(responseData)) {
          userData = responseData;
        } else if (responseData.users && Array.isArray(responseData.users)) {
          userData = responseData.users;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          userData = responseData.data;
        } else {
          console.error('Unexpected response format:', responseData);
          throw new Error('Formato de respuesta inesperado');
        }
        
        setUsers(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      const response = await fetch(`http://localhost:3000/api/users/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      // Actualizar la lista eliminando el usuario
      setUsers(users.filter(user => user.id !== userId));
      alert('Usuario eliminado con éxito');
    } catch (err) {
      alert('Error al eliminar usuario: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2 className="users-title">Lista de Usuarios</h2>
        <p className="loading-text">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="users-title">Lista de Usuarios</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={handleRetry} className="retry-button">
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="users-container">
      <h2 className="users-title">📋 Lista de Usuarios</h2>
      
      {!Array.isArray(users) || users.length === 0 ? (
        <p className="no-users-message">No hay usuarios disponibles.</p>
      ) : (
        <div>
          <p className="users-summary">
            Total de usuarios: <strong>{users.length}</strong>
          </p>
          
          <div className="table-container">
            <table className="users-table">
              <thead className="table-header">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Categoría</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id || index} className="table-row">
                    <td className="table-cell">{user.id || 'N/A'}</td>
                    <td className="table-cell">{user.name}</td>
                    <td className="table-cell">{user.surname}</td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell">{user.phoneNumber || 'No especificado'}</td>
                    <td className="table-cell">
                      {user.categoryName || user.category?.usertype || user.category?.name || 'Sin categoría'}
                    </td>
                    <td className="table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/users/detail/${user.id}`} 
                          className="action-button view-button"
                          title="Ver detalles"
                        >
                          👁️ Ver
                        </Link>
                        <Link 
                          to={`/admin/users/update/${user.id}`} 
                          className="action-button edit-button"
                          title="Editar usuario"
                        >
                          ✏️ Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(user.id!)} 
                          className="action-button delete-button"
                          title="Eliminar usuario"
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
        </div>
      )}
    </div>
  );
};

export default UsersGetAll;

