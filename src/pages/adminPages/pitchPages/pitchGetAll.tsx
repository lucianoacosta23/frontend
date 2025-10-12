import { useEffect, useState, useCallback } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';

export default function PitchGetAll() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getAll = useCallback(async () => {
        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/pitchs/getAll', {
                method: "GET", 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errors = await response.json();
                throw errors;
            }
            const json: PitchResponse = await response.json();
            setData(json);
        } catch (error) {
            showNotification(errorHandler(error), 'error');
            setError(true);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (!error) {
            getAll();
        }
    }, [error, getAll]);

    const remove = async (id: number) => {
        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/pitchs/remove/' + id, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errors = await response.json();
                throw errors;
            }
            showNotification('Cancha eliminada con éxito!', 'success');
            getAll();
        } catch (error) {
            showNotification(errorHandler(error), 'error');
        }
    };

    const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (confirm("¿Estas seguro que quieres eliminar la cancha seleccionada?")) {
            if (e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
    };

    if (loading) return 'Loading...';

    return (
        <div>
            <pre>
                <table className='crudTable'>
                    <thead>
                        <tr> {/* Agregado: envolver th en tr */}
                            <th>ID</th>
                            <th>Business ID</th>
                            <th>Rating</th>
                            <th>Price</th>
                            <th>Size</th>
                            <th>Ground type</th>
                            <th>Roof</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((pitch) => (
                            <tr key={pitch.id}>
                                <td>{pitch.id}</td>
                                <td>{pitch.business?.id ?? '-'}</td>
                                <td>{('⭐️').repeat(pitch.rating)}</td>
                                <td>${pitch.price}</td>
                                <td>{pitch.size}</td>
                                <td>{pitch.groundType}</td>
                                <td>{pitch.roof ? 'Techado' : 'Sin techo'}</td>
                                <td><button className='action-button delete' onClick={handleDeleteSubmit} value={pitch.id}>Eliminar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </pre>
        </div>
    );
}

type PitchResponse = {
    data: Pitch[];
};