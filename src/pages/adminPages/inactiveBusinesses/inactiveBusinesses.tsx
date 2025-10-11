import { useOutletContext } from "react-router";
import { useCallback, useState, useEffect } from "react";
import '../../../static/css/crudTable.css'
import type { BusinessData } from "../../../types/businessType";

interface Locality {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function InactiveBusinesses() {
    const [data, setData] = useState<BusinessData[]>([]);
    const [inactiveBusinesses, setInactiveBusinesses] = useState<BusinessData[]>([]);
    const [localities, setLocalities] = useState<Locality[]>([]);
    const [owners, setOwners] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    // Cargar localidades
    const fetchLocalities = async (token: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/localities/getAll', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const localitiesData = await response.json();
                const localitiesArray = Array.isArray(localitiesData) ? localitiesData : 
                                    localitiesData.data || localitiesData.localities || [];
                setLocalities(localitiesArray);
            }
        } catch (error) {
            console.error('Error cargando localidades:', error);
        }
    };

    // Cargar usuarios
    const fetchOwners = async (token: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/users/findAll', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const ownersData = await response.json();
                const ownersArray = Array.isArray(ownersData) ? ownersData : 
                                ownersData.data || ownersData.users || [];
                setOwners(ownersArray);
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    };

    // Función para obtener el nombre de la localidad
    const getLocalityName = (locality: number | Locality): string => {
        if (typeof locality === 'object' && locality !== null) {
            return locality.name;
        } else if (typeof locality === 'number') {
            const foundLocality = localities.find(l => l.id === locality);
            return foundLocality?.name || `ID: ${locality}`;
        }
        return 'N/A';
    };

    // Función para obtener el nombre del dueño
    const getOwnerName = (owner: number | User): string => {
        if (typeof owner === 'object' && owner !== null) {
            return owner.name || owner.email || 'N/A';
        } else if (typeof owner === 'number') {
            const foundOwner = owners.find(o => o.id === owner);
            return foundOwner?.name || foundOwner?.email || `ID: ${owner}`;
        }
        return 'N/A';
    };

    const getAll = useCallback(async () => {
        try {
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            // Cargar datos en paralelo
            await Promise.all([
                fetchBusinesses(token),
                fetchLocalities(token),
                fetchOwners(token)
            ]);
            
        } catch (error) {
            showNotification('' + error, 'error')
            setError(true)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }, [showNotification])

    const fetchBusinesses = async (token: string) => {
        const response = await fetch('http://localhost:3000/api/business/findAll', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status == 404) {
                throw new Error("No hay negocios registrados")
            }
            throw new Error("HTTP Error! status: " + response.status)
        }
        
        const json = await response.json();
        
        // Procesar la respuesta para obtener el array de negocios
        let businessesData: BusinessData[] = [];
        if (Array.isArray(json)) {
            businessesData = json;
        } else if (json.data && Array.isArray(json.data)) {
            businessesData = json.data;
        } else if (json.businesses && Array.isArray(json.businesses)) {
            businessesData = json.businesses;
        }
        
        setData(businessesData);
        
        // Filtrar negocios inactivos
        const inactive = businessesData.filter(business => !business.active);
        setInactiveBusinesses(inactive);
    };

    useEffect(() => {
        if (!error) {
            getAll();
        }
    }, [error, getAll])

    // Función simplificada para activar el negocio
    const activateBusiness = async (id: number) => {
        try {
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            
            const response = await fetch(`http://localhost:3000/api/business/activate/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    active: true  // Solo enviamos el campo active
                })
            })
            
            if (!response.ok) {
                throw new Error("HTTP Error! status: " + response.status)
            }
            
            showNotification('Negocio habilitado con éxito!', 'success');
            
            // Recargar los datos después de activar
            getAll();
            
        } catch (error) {
            showNotification('Error: ' + error, 'error');
            setLoading(false);
        }
    }

    const handleActivateSubmit = (businessId: number) => {
        if (confirm("¿Estás seguro que quieres habilitar este negocio?")) {
            activateBusiness(businessId);
        }
    };

    // Función para formatear el porcentaje de depósito
    const formatDepositPercentage = (percentage: number) => {
        return `${(percentage * 100).toFixed(1)}%`;
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="crud-home-container">
                <h1 className="crud-title">Habilitación de Negocios</h1>
                
                {/* Estadísticas */}
                <div className="stats-container" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div className="stat-item">
                            <strong>Total de negocios:</strong> {data.length}
                        </div>
                        <div className="stat-item">
                            <strong>Negocios activos:</strong> {data.filter(b => b.active).length}
                        </div>
                        <div className="stat-item">
                            <strong>Negocios inactivos:</strong> 
                            <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                {inactiveBusinesses.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="content-area">
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="loading-spinner"></div>
                            <p>Cargando datos...</p>
                        </div>
                    )}
                    
                    {!loading && inactiveBusinesses.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <p>No hay negocios inactivos pendientes de habilitación.</p>
                        </div>
                    )}

                    {!loading && inactiveBusinesses.length > 0 && (
                        <table className='crudTable'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre del Negocio</th>
                                    <th>Dueño</th>
                                    <th>Localidad</th>
                                    <th>Dirección</th>
                                    <th>Horario</th>
                                    <th>Depósito</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inactiveBusinesses.map((business) => (
                                    <tr key={business.id}>
                                        <td>{business.id}</td>
                                        <td style={{ fontWeight: 'bold' }}>{business.businessName}</td>
                                        <td>
                                            <div>
                                                <div><strong>{getOwnerName(business.owner)}</strong></div>
                                                <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                                    {typeof business.owner === 'object' 
                                                        ? `ID: ${business.owner.id}`
                                                        : `ID: ${business.owner}`}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div><strong>{getLocalityName(business.locality)}</strong></div>
                                                <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                                    {typeof business.locality === 'object' 
                                                        ? `ID: ${business.locality.id}`
                                                        : `ID: ${business.locality}`}
                                                </small>
                                            </div>
                                        </td>
                                        <td>{business.address}</td>
                                        <td>{business.openingAt} - {business.closingAt}</td>
                                        <td>{formatDepositPercentage(business.reservationDepositPercentage)}</td>
                                        <td>
                                            <button 
                                                className='action-button activate' 
                                                onClick={() => handleActivateSubmit(business.id!)}
                                                style={{ 
                                                    background: '#22c55e', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '0.5rem 1rem', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ✅ Habilitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}