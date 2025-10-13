import { useState, useCallback, useEffect } from 'react';
import type { Pitch } from '../../types/pitchType.ts';
import { useNavigate, useOutletContext, useParams, Navigate } from 'react-router';

export default function BusinessPitchEdit() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<Pitch | null>(null);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // VERIFICACIÓN DE SESIÓN
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert('sesion no iniciada');
        return <Navigate to="/login" />;
    }

    // FUNCIÓN PARA OBTENER TOKEN Y USERID
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
                    }
                } catch (decodeError) {
                    console.error('Error decodificando token:', decodeError);
                }
            }

            return { token, userId };
        } catch (error) {
            console.error('Error obteniendo datos de auth:', error);
            throw error;
        }
    }, []);

    // FUNCIÓN PARA OBTENER EL BUSINESSID DEL USUARIO
    const getBusinessId = useCallback(async () => {
        try {
            const { token, userId } = getAuthData();
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            const response = await fetch(`http://localhost:3000/api/business/findByOwnerId/${userId}`, {
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
                return null;
            }
            
            if (response.status === 404) {
                setHasNoBusiness(true);
                showNotification('No tienes un negocio registrado aún', 'warning');
                return null;
            }
            
            if (!response.ok) {
                const errors = await response.json();
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener el negocio'}`);
            }
            
            const businessData = await response.json();
            
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
                setHasNoBusiness(true);
                showNotification('No se encontró información válida del negocio', 'warning');
                return null;
            }
            
            setBusinessId(extractedBusinessId);
            setHasNoBusiness(false);
            return extractedBusinessId;
            
        } catch (error) {
            console.error('Error getting business ID:', error);
            showNotification('Error al obtener el negocio: ' + error, 'error');
            setHasNoBusiness(true);
            throw error;
        }
    }, [getAuthData, showNotification]);

    // OBTENER DATOS DE LA CANCHA A EDITAR
    const getPitchData = useCallback(async () => {
        try {
            setLoading(true);
            const { token } = getAuthData();

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            if (!id) {
                throw new Error('No se proporcionó ID de cancha');
            }

            const response = await fetch(`http://localhost:3000/api/pitchs/getOne/${id}`, {
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
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener la cancha'}`);
            }

            const json: PitchResponse = await response.json();
            setData(json);
            setOriginalData(json.data);
            
            // CARGAR PREVIEW DE IMAGEN EXISTENTE
            if (json.data.imageUrl) {
                setImagePreview(json.data.imageUrl);
            }
            
        } catch (error) {
            console.error('Error obteniendo cancha:', error);
            showNotification('Error al cargar la cancha: ' + error, 'error');
        } finally {
            setLoading(false);
        }
    }, [id, getAuthData, showNotification]);

    // EFECTO PARA OBTENER DATOS INICIALES
    useEffect(() => {
        const initializeData = async () => {
            await getBusinessId();
            await getPitchData();
        };

        initializeData();
    }, [getBusinessId, getPitchData]);

    // Opciones válidas para el tamaño
    const sizeOptions = [
        { value: '5v5', label: 'Fut 5' },
        { value: '7v7', label: 'Fut 7' },
        { value: '11v11', label: 'Fut 11' }
    ];

    // TIPOS DE SUELO
    const groundTypeOptions = [
        { value: 'césped natural', label: 'Césped Natural' },
        { value: 'césped sintético', label: 'Césped Sintético' },
        { value: 'cemento', label: 'Cemento' },
        { value: 'arcilla', label: 'Arcilla' }
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La imagen no debe superar los 5MB', 'error');
                return;
            }

            setImageFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const update = async (pitchData: Partial<Pitch> & { id: number }) => {
        try {
            setLoading(true);
            const { token } = getAuthData();

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            if (!id) {
                throw new Error('No se proporcionó ID de cancha');
            }

            console.log('Actualizando cancha con ID:', id);
            console.log('Payload a enviar:', pitchData);

            const response = await fetch(`http://localhost:3000/api/pitchs/update/${id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pitchData)
            });

            console.log('Status:', response.status);

            if (!response.ok) {
                const errors = await response.json();
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al actualizar la cancha'}`);
            }

            const json: PitchResponse = await response.json();
            setData(json);
            showNotification('✅ Cancha actualizada con éxito', 'success');
            navigate(-1);
            
        } catch (error) {
            console.error('❌ Error completo:', error);
            showNotification('❌ Error: ' + error, 'error');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!businessId) {
            showNotification('No se pudo obtener el ID del negocio', 'error');
            return;
        }

        if (!id) {
            showNotification('No se proporcionó ID de cancha', 'error');
            return;
        }

        const formData = new FormData(e.currentTarget);
        
        const pitch: Partial<Pitch> & { id: number } = {
            id: Number(id)
        };


        const priceValue = formData.get("price");
        if (priceValue && priceValue.toString().trim() !== '') {
            const price = Number(priceValue);
            if (!isNaN(price) && price > 0) {
                pitch.price = price;
            } else {
                showNotification('El precio debe ser un número mayor a 0', 'error');
                return;
            }
        }

        const sizeValue = formData.get("size");
        if (sizeValue && sizeValue.toString().trim() !== '') {
            pitch.size = sizeValue.toString().trim();
        }

        const groundTypeValue = formData.get("groundType");
        if (groundTypeValue && groundTypeValue.toString().trim() !== '') {
            pitch.groundType = groundTypeValue.toString().trim();
        }

        const roofValue = formData.get("roof");
        if (roofValue !== null) {
            pitch.roof = roofValue === 'on' || roofValue === 'true';
        }

        pitch.business = businessId;

        console.log('Datos del formulario:', pitch);

        // Verificar que al menos un campo se va a actualizar (excluyendo business e id)
        const { id: pitchId, business, ...fieldsToUpdate } = pitch;
        if (Object.keys(fieldsToUpdate).length === 0) {
            showNotification('Debe modificar al menos un campo para actualizar', 'warning');
            return;
        }

        update(pitch);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(originalData?.imageUrl || null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };
    
    if (loading && !originalData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando información de la cancha...</p>
            </div>
        );
    }

    // MANEJO ESPECÍFICO PARA USUARIOS SIN NEGOCIO
    if (hasNoBusiness) {
        return (
            <div className="no-business-container">
                <h3>🏢 No tienes un negocio registrado</h3>
                <p>Para editar canchas, primero debes registrar tu negocio.</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => window.location.href = '/registerBusiness'} 
                        className="primary-button"
                    >
                        📝 Registrar mi negocio
                    </button>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="secondary-button"
                    >
                        🔄 Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (!originalData) {
        return (
            <div className="no-data-container">
                <h3>📭 No se encontró la cancha</h3>
                <p>No existe una cancha con el ID: {id}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="secondary-button"
                >
                    ↩️ Volver
                </button>
            </div>
        );
    }

    return (
        <div className='crud-form-container'>
            <div className="form-header edit-header">
                <h2 className='crud-form-title'>
                    <span className="edit-icon">✏️</span>
                    Editar cancha
                </h2>
                <div className="edit-subtitle">
                    <span className="badge-editing">Modo Edición</span>
                    <p>Modificando la cancha ID: <strong>{id}</strong></p>
                </div>
            </div>
            <div className="current-data-section">
                <h3>📋 Datos Actuales de la Cancha</h3>
                <div className="current-data-grid">
                    <div className="current-data-item">
                        <label>Rating Actual:</label>
                        <span>{('⭐️').repeat(Math.floor(originalData.rating))} ({originalData.rating})</span>
                    </div>
                    <div className="current-data-item">
                        <label>Precio Actual:</label>
                        <span>${originalData.price?.toLocaleString()}</span>
                    </div>
                    <div className="current-data-item">
                        <label>Tamaño Actual:</label>
                        <span>{originalData.size}</span>
                    </div>
                    <div className="current-data-item">
                        <label>Tipo de Suelo Actual:</label>
                        <span>{originalData.groundType}</span>
                    </div>
                    <div className="current-data-item">
                        <label>Techo Actual:</label>
                        <span>{originalData.roof ? '✅ Con techo' : '❌ Sin techo'}</span>
                    </div>
                    {originalData.imageUrl && (
                        <div className="current-data-item">
                            <label>Imagen Actual:</label>
                            <div className="current-image">
                                <img 
                                    src={originalData.imageUrl} 
                                    alt="Imagen actual de la cancha"
                                    className="current-image-preview"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="edit-form-section">
                <h3>📝 Formulario de Edición</h3>
                <p className="edit-instruction">Modifica los campos que deseas cambiar:</p>
                
                <form onSubmit={handleSubmit} className='crud-form'>

                    <div className='crud-form-item'>
                        <label>Precio por hora 💰</label>
                        <input 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            placeholder="Ej: 25000"
                            min="0"
                            defaultValue={originalData.price}
                        />
                        <small>Precio en pesos colombianos</small>
                    </div>

                    <div className='crud-form-item'>
                        <label>Tamaño de cancha 📏</label>
                        <select name="size" defaultValue={originalData.size}>
                            <option value="">Selecciona un tamaño</option>
                            {sizeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <small>Selecciona el formato de la cancha</small>
                    </div>

                    <div className='crud-form-item'>
                        <label>Tipo de suelo 🌱</label>
                        <select name="groundType" defaultValue={originalData.groundType}>
                            <option value="">Selecciona un tipo de suelo</option>
                            {groundTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <small>Tipos disponibles: Césped Natural, Césped Sintético, Cemento, Arcilla</small>
                    </div>

                    <div className='crud-form-item'>
                        <label className='checkbox-label'>
                            <input 
                                type="checkbox" 
                                name="roof" 
                                defaultChecked={originalData.roof}
                            />
                            <span>🏠 Cancha techada</span>
                        </label>
                        <small>Marca si la cancha tiene techo o cubierta</small>
                    </div>

                    <div className='crud-form-actions'>
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            className="secondary-button"
                        >
                            ↩️ Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className='primary-button edit-save-button' 
                            disabled={loading || !businessId}
                        >
                            {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>

            <style>
                {`
                .edit-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                }
                
                .edit-icon {
                    font-size: 1.5em;
                    margin-right: 0.5rem;
                }
                
                .edit-subtitle {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-top: 0.5rem;
                }
                
                .badge-editing {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .current-data-section {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                    margin-bottom: 2rem;
                }
                
                .current-data-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .current-data-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .current-data-item label {
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.9rem;
                }
                
                .current-data-item span {
                    color: #1e293b;
                    font-size: 1rem;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid #e2e8f0;
                }
                
                .current-image-preview {
                    max-width: 150px;
                    max-height: 100px;
                    border-radius: 4px;
                    border: 2px solid #e2e8f0;
                }
                
                .edit-form-section {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                }
                
                .edit-instruction {
                    color: #64748b;
                    margin-bottom: 1.5rem;
                    font-style: italic;
                }
                
                .edit-save-button {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                .edit-save-button:hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                }
                `}
            </style>
        </div>
    );
}

type PitchResponse = {
    data: Pitch;
}