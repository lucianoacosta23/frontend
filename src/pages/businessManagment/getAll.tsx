import { useEffect, useState, useCallback } from 'react';
import type {Pitch} from '../../types/pitchType.ts'
import { useOutletContext, Navigate, useNavigate } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import '../../static/css/MybusinessGetAll.css';

export default function BusinessPitchGetAll() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    // VERIFICACIÓN DE SESIÓN
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert('sesion no iniciada');
        return <Navigate to="/login" />;
    }

    // FUNCIÓN SIMPLIFICADA para obtener token y userId
    const getAuthData = useCallback(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('No se encontró información de usuario');
            }

            let token: string;
            let userId: number | null = null;

            try {
                const userObject = JSON.parse(userStr);
                token = userObject.token || userStr;
                userId = userObject.id;
            } catch {
                token = userStr;
            }

            if (!userId && token) {
                try {
                    const payload = token.split('.')[1];
                    if (payload) {
                        const decoded = JSON.parse(atob(payload));
                        userId = decoded.id || decoded.userId || decoded.sub;
                        console.log('Usuario decodificado del token:', decoded);
                    }
                } catch (decodeError) {
                    console.error('Error decodificando token:', decodeError);
                }
            }

            console.log('Token extraído:', token.substring(0, 50) + '...');
            console.log('UserId extraído:', userId);

            return { token, userId };
        } catch (error) {
            console.error('Error obteniendo datos de auth:', error);
            throw error;
        }
    }, []);

    // FUNCIÓN CORREGIDA para obtener el businessId del usuario
    const getBusinessId = useCallback(async () => {
        try {
            const { token, userId } = getAuthData();
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            console.log('Obteniendo business para usuario:', userId);
            console.log('URL completa:', `http://localhost:3000/api/business/findByOwnerId/${userId}`);

            const response = await fetch(`http://localhost:3000/api/business/findByOwnerId/${userId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user');
                alert('Sesión expirada o inválida');
                window.location.href = '/login';
                return;
            }
            
            // MANEJO ESPECÍFICO DEL 404
            if (response.status === 404) {
                console.log('No se encontró negocio para este usuario');
                setHasNoBusiness(true);
                setLoading(false);
                showNotification('No tienes un negocio registrado aún', 'warning');
                return null;
            }
            
            if (!response.ok) {
                const errors = await response.json();
                console.error('Error response:', errors);
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener el negocio'}`);
            }
            
            const businessData = await response.json();
            console.log('Business data recibida:', businessData);
            
            let extractedBusinessId;
            if (businessData.id) {
                extractedBusinessId = businessData.id;
            } else if (businessData.data && businessData.data.id) {
                extractedBusinessId = businessData.data.id;
            } else if (Array.isArray(businessData) && businessData.length > 0) {
                extractedBusinessId = businessData[0].id;
            } else if (Array.isArray(businessData.data) && businessData.data.length > 0) {
                extractedBusinessId = businessData.data[0].id;
            }
            
            if (!extractedBusinessId) {
                console.log('Respuesta del negocio no contiene ID válido');
                setHasNoBusiness(true);
                setLoading(false);
                showNotification('No se encontró información válida del negocio', 'warning');
                return null;
            }
            
            console.log('Business ID encontrado:', extractedBusinessId);
            setBusinessId(extractedBusinessId);
            setHasNoBusiness(false);
            return extractedBusinessId;
            
        } catch (error) {
            console.error('Error getting business ID:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
            throw error;
        }
    }, [getAuthData, showNotification]);

    const getAll = useCallback(async (currentBusinessId?: number) => {
        try {
            setLoading(true);
            setError(false);
            
            let targetBusinessId = currentBusinessId || businessId;
            if (!targetBusinessId) {
                targetBusinessId = await getBusinessId();
                if (!targetBusinessId) {
                    // No hay negocio, no continuar
                    return;
                }
            }

            const { token } = getAuthData();
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            console.log('Obteniendo canchas para business:', targetBusinessId);

            const response = await fetch(`http://localhost:3000/api/pitchs/getByBusiness/${targetBusinessId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user');
                alert('Sesión expirada o inválida');
                window.location.href = '/login';
                return;
            }

            // MANEJO ESPECÍFICO PARA 404 - No hay canchas (NO ES ERROR)
            if (response.status === 404) {
                console.log('No se encontraron canchas para este negocio');
                setData({ data: [] });
                showNotification('No tienes canchas registradas aún', 'info');
                return;
            }
            
            if (!response.ok) {
                const errors = await response.json();
                console.error('Error response:', errors);
                
                // MANEJO ESPECÍFICO del mensaje "No pitches found"
                if (errors.error && errors.error.includes('No pitches found')) {
                    console.log('Backend indica que no hay canchas para este negocio');
                    setData({ data: [] });
                    showNotification('No tienes canchas registradas aún', 'info');
                    return;
                }
                
                throw new Error(`Error ${response.status}: ${errors.message || errors.error || 'Error al obtener las canchas'}`);
            }
            
            const json: PitchResponse = await response.json();
            console.log('Canchas recibidas:', json);
            setData(json);
            
        } catch (error) {
            console.error('Error getting pitches:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [businessId, getBusinessId, getAuthData, showNotification]);

    // FUNCIÓN PARA RE-INICIALIZAR
    const initializeData = useCallback(async () => {
        try {
            setError(false);
            setHasNoBusiness(false);
            const { token } = getAuthData();
            if (!token) {
                showNotification('Usuario no autenticado', 'error');
                setError(true);
                setLoading(false);
                return;
            }

            const currentBusinessId = await getBusinessId();
            if (currentBusinessId) {
                await getAll(currentBusinessId);
            }
        } catch (error) {
            console.error('Error inicializando datos:', error);
            setError(true);
            setLoading(false);
        }
    }, [getAuthData, getBusinessId, getAll, showNotification]);

    useEffect(() => {
        initializeData();
    }, []);

    const remove = async (id: number) => {
        try {
            setLoading(true);
            const { token } = getAuthData();
            
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`http://localhost:3000/api/pitchs/remove/${id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user');
                alert('Sesión expirada o inválida');
                window.location.href = '/login';
                return;
            }
            
            if (!response.ok) {
                const errors = await response.json();
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al eliminar la cancha'}`);
            }
            
            showNotification('Cancha eliminada con éxito!', 'success');
            await getAll(businessId || undefined);
            
        } catch (error) {
            console.error('Error eliminando cancha:', error);
            showNotification(errorHandler(error), 'error');
            setLoading(false);
        }
    };

    const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (confirm("¿Estás seguro que quieres eliminar la cancha seleccionada?")) {
            if (e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
    };

    // FUNCIÓN PARA NAVEGAR AL DETALLE
    const handleViewDetail = (pitchId: number) => {
        navigate(`/myBusiness/detail/${pitchId}`);
    };

    // FUNCIÓN PARA NAVEGAR A EDITAR
    const handleEdit = (pitchId: number) => {
        navigate(`/MyBusiness/edit/${pitchId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando canchas del negocio...</p>
            </div>
        );
    }

    // Manejo específico para usuarios sin negocio
    if (hasNoBusiness) {
        return (
            <div className="no-business-container">
                <h3>🏢 No tienes un negocio registrado</h3>
                <p>Para gestionar canchas, primero debes registrar tu negocio.</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => window.location.href = '/registerBusiness'} 
                        className="primary-button"
                    >
                        📝 Registrar mi negocio
                    </button>
                    <button onClick={initializeData} className="secondary-button">
                        🔄 Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error al cargar las canchas del negocio</p>
                <button onClick={initializeData} className="retry-button">
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="no-data-container">
                <h3>📭 No hay canchas registradas</h3>
                <p>Aún no tienes canchas asociadas a tu negocio.</p>
                <p>Negocio ID: {businessId}</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => window.location.href = '/admin/pitch/create'} 
                        className="primary-button"
                    >
                        ➕ Registrar primera cancha
                    </button>
                    <button onClick={initializeData} className="secondary-button">
                        🔄 Actualizar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="table-header">
            </div>
            
            <table className='crudTable'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Rating</th>
                        <th>Precio</th>
                        <th>Tamaño</th>
                        <th>Tipo de suelo</th>
                        <th>Techo</th>
                        <th>Imagen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.data.map((pitch) => (
                        <tr key={pitch.id}>
                            <td>{pitch.id}</td>
                            <td>
                                {('⭐️').repeat(Math.floor(pitch.rating))} 
                                <span className="rating-number">({pitch.rating})</span>
                            </td>
                            <td>${pitch.price?.toLocaleString()}</td>
                            <td>{pitch.size}</td>
                            <td>{pitch.groundType}</td>
                            <td>
                                {pitch.roof ? '✅ Con techo' : '❌ Sin techo'}
                            </td>
                            <td>
                                {pitch.imageUrl ? (
                                    <img 
                                        src={pitch.imageUrl} 
                                        alt={`Cancha ${pitch.id}`}
                                        className="table-image"
                                        style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span>Sin imagen</span>
                                )}
                            </td>
                            <td>
                                <div className="action-buttons-container">
                                    <button 
                                        className='action-button detail' 
                                        onClick={() => handleViewDetail(pitch.id!)}
                                        title="Ver detalle de la cancha"
                                    >
                                        👁️ Ver
                                    </button>
                                    <button 
                                        className='action-button edit' 
                                        onClick={() => handleEdit(pitch.id!)}
                                        title="Editar cancha"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        className='action-button delete' 
                                        onClick={handleDeleteSubmit} 
                                        value={pitch.id}
                                        title="Eliminar cancha"
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
    );
}

type PitchResponse = {
    data: Pitch[];
};