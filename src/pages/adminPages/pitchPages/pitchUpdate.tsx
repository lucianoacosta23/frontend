import { useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useNavigate, useOutletContext } from 'react-router';

export default function PitchUpdate(){
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    const update = async (pitch: Partial<Pitch> & { id: number }) => {
        try{
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            
            if (!token) {
                throw new Error('Token de autenticación no encontrado');
            }
            
            // 🎯 MEJOR VALIDACIÓN: Filtrar solo los campos que tienen valor válido
            const payload: Record<string, any> = {};
            
            if (pitch.rating !== undefined && pitch.rating > 0) {
                payload.rating = pitch.rating;
            }
            if (pitch.price !== undefined && pitch.price > 0) {
                payload.price = pitch.price;
            }
            if (pitch.size !== undefined && pitch.size.trim() !== '') {
                payload.size = pitch.size.trim();
            }
            if (pitch.groundType !== undefined && pitch.groundType.trim() !== '') {
                payload.groundType = pitch.groundType.trim();
            }
            if (pitch.roof !== undefined) {
                payload.roof = pitch.roof;
            }

            console.log('🎯 Payload a enviar:', payload); // DEBUG

            const response = await fetch(`http://localhost:3000/api/pitchs/update/${pitch.id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })
            
            if(!response.ok){
                const errorText = await response.text();
                console.error('🎯 Error response:', errorText); // DEBUG
                throw new Error(`HTTP Error! status: ${response.status} - ${errorText}`);
            }
            
            const json: PitchResponse = await response.json()
            setData(json)
            showNotification('Cancha actualizada con éxito!', 'success')
            navigate('/admin/pitchs/getAll')
        }catch(error){
            console.error('🎯 Error completo:', error); // DEBUG
            showNotification(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error')
        }finally{
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // 🎯 VALIDACIÓN MEJORADA: Solo el ID es obligatorio
        const pitchId = Number(formData.get("id"));
        if (!pitchId || isNaN(pitchId)) {
            showNotification('El ID de cancha debe ser un número válido', 'error');
            return;
        }

        // 🎯 MEJOR MANEJO: Crear objeto pitch con solo los campos que tienen valor
        const pitch: Partial<Pitch> & { id: number } = {
            id: pitchId
        };

        // 🎯 VALIDACIÓN MEJORADA: Solo agregar campos si tienen valor válido
        const ratingValue = formData.get("rating");
        if (ratingValue && ratingValue.toString().trim() !== '') {
            const rating = Number(ratingValue);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                pitch.rating = rating;
            } else {
                showNotification('El rating debe ser un número entre 1 y 5', 'error');
                return;
            }
        }

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

        // 🎯 CORREGIDO: Manejo correcto del checkbox
        const roofValue = formData.get("roof");
        if (roofValue !== null) {
            pitch.roof = roofValue === 'on' || roofValue === 'true';
        }

        console.log('🎯 Datos del formulario:', pitch); // DEBUG

        // Verificar que al menos un campo se va a actualizar
        const { id, ...fieldsToUpdate } = pitch;
        if (Object.keys(fieldsToUpdate).length === 0) {
            showNotification('Debe completar al menos un campo para actualizar', 'warning');
            return;
        }

        update(pitch);
    };

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Actualizar cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>ID de cancha *</label>
                    <input 
                        type="number" 
                        name="id" 
                        required 
                        min="1"
                        placeholder="Ingrese el ID de la cancha"
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Rating (1-5)</label>
                    <input 
                        name="rating" 
                        type="number" 
                        min="1" 
                        max="5" 
                        step="0.1"
                        placeholder="Opcional - Rating de 1 a 5" 
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Precio ($)</label>
                    <input 
                        name="price" 
                        type="number" 
                        min="0" 
                        step="100"
                        placeholder="Opcional - Precio por hora" 
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Tamaño</label>
                    <select name="size">
                        <option value="">Seleccionar tamaño (opcional)</option>
                        <option value="5v5">futbol 5</option>
                        <option value="7v7">futbol 7</option>
                        <option value="11v11">futbol 11</option>
                    </select>
                </div>
                
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select name="groundType">
                        <option value="">Seleccionar tipo (opcional)</option>
                        <option value="Césped natural">Césped natural</option>
                        <option value="Césped sintético">Césped sintético</option>
                        <option value="Cemento">Cemento</option>
                        <option value="Tierra">Tierra</option>
                    </select>
                </div>
                
                <div className='crud-form-item'>
                    <label>
                        <input type="checkbox" name="roof" />
                        Tiene techo
                    </label>
                </div>
                
                <div className='crud-form-actions'>
                    <button type="submit" className='primary' disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </form>
            
            {loading && (
                <div className="loading-message">
                    <p>⏳ Actualizando cancha...</p>
                </div>
            )}
            
            {data && (
                <div className="success-result">
                    <h3>✅ Cancha actualizada exitosamente</h3>
                    <table className='crudTable'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Rating</th>
                                <th>Precio</th>
                                <th>Tamaño</th>
                                <th>Tipo de suelo</th>
                                <th>Techo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{data.updatedPitch.id}</td>
                                <td>{('⭐️').repeat(Math.floor(data.updatedPitch.rating))} ({data.updatedPitch.rating})</td>
                                <td>${data.updatedPitch.price.toLocaleString()}</td>
                                <td>{data.updatedPitch.size}</td>
                                <td>{data.updatedPitch.groundType}</td>
                                <td>{data.updatedPitch.roof ? '✅ Con techo' : '❌ Sin techo'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

type PitchResponse = {
    updatedPitch: Pitch
}