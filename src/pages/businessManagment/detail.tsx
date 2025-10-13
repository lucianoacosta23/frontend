import type { Pitch } from '../../types/pitchType.ts';
import { useState, useEffect } from 'react';
import { useOutletContext, useParams, Navigate } from 'react-router';

import '../../static/css/MybusinessDetail.css'
export default function businessPitchDetail() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const { id } = useParams<{ id: string }>();

    // 🎯 VERIFICACIÓN DE SESIÓN
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert('sesion no iniciada');
        return <Navigate to="/login" />;
    }

    const getOne = async (pitchId: string) => {
        try {
            setLoading(true);
            setError(false);
            
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const response = await fetch(`http://localhost:3000/api/pitchs/getOne/${pitchId}`, {
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
            
        } catch (error) {
            console.error('Error obteniendo cancha:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getOne(id);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando información de la cancha...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>❌ Error al cargar la cancha</h3>
                <p>No se pudo obtener la información de la cancha con ID: {id}</p>
                <button 
                    onClick={() => id && getOne(id)} 
                    className="retry-button"
                >
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="no-data-container">
                <h3>📭 No se encontró la cancha</h3>
                <p>No existe una cancha con el ID: {id}</p>
            </div>
        );
    }

    return (
        <div className='crud-form-container'>
            <div className="detail-header">
                <h2 className='crud-form-title'>Detalle de Cancha</h2>
                <p className="detail-id">ID: {id}</p>
            </div>

            <div className="detail-content">
                <div className="detail-section">
                    <h3>📊 Información General</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>ID</label>
                            <span>{data.data.id}</span>
                        </div>
                        <div className="detail-item">
                            <label>Negocio ID</label>
                            <span>{data.data.business?.id || data.data.business || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Rating</label>
                            <span>
                                {('⭐️').repeat(Math.floor(data.data.rating))} 
                                <span className="rating-number">({data.data.rating})</span>
                            </span>
                        </div>
                        <div className="detail-item">
                            <label>Precio</label>
                            <span>${data.data.price?.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                            <label>Tamaño</label>
                            <span>{data.data.size}</span>
                        </div>
                        <div className="detail-item">
                            <label>Tipo de suelo</label>
                            <span>{data.data.groundType}</span>
                        </div>
                        <div className="detail-item">
                            <label>Techo</label>
                            <span>{data.data.roof ? '✅ Con techo' : '❌ Sin techo'}</span>
                        </div>
                    </div>
                </div>

                {data.data.imageUrl && (
                    <div className="detail-section">
                        <h3>🖼️ Imagen</h3>
                        <div className="image-container">
                            <img 
                                src={data.data.imageUrl} 
                                alt={`Cancha ${data.data.id}`}
                                className="detail-image"
                            />
                        </div>
                    </div>
                )}

                <div className="detail-section">
                    <h3>📅 Información Adicional</h3>
                    <div className="detail-grid">
                        {data.data.createdAt && (
                            <div className="detail-item">
                                <label>Creado</label>
                                <span>{new Date(data.data.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        {data.data.updatedAt && (
                            <div className="detail-item">
                                <label>Actualizado</label>
                                <span>{new Date(data.data.updatedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        {data.data.driveFileId && (
                            <div className="detail-item">
                                <label>Drive File ID</label>
                                <span className="file-id">{data.data.driveFileId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {data.data.reservations && data.data.reservations.length > 0 && (
                    <div className="detail-section">
                        <h3>📅 Reservaciones</h3>
                        <p>{data.data.reservations.length} reservación(es)</p>
                    </div>
                )}
            </div>

            <div className="detail-actions">
                <button 
                    onClick={() => window.history.back()} 
                    className="secondary-button"
                >
                    ↩️ Volver
                </button>
            </div>
        </div>
    );
}

type PitchResponse = {
    data: Pitch;
}