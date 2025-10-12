import { useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useNavigate, useOutletContext } from 'react-router';

export default function PitchAdd(){
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
        
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    const add = async (pitch:Pitch) =>{
        try{
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/pitchs/add',{method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }, 
                body: JSON.stringify(pitch)}
            )
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const json:PitchResponse = await response.json()
            setData(json)
            showNotification('Cancha creada con éxito', 'success')
            navigate('/admin/pitchs/getAll')
        }catch(error){
            showNotification('Error: ' + error, 'error')
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const pitch:Pitch = {
            id:0,
            businessId:Number(formData.get("businessId")),
            rating:Number(formData.get("rating")),
            price:Number(formData.get("price")),
            size:String(formData.get("size")),
            groundType:String(formData.get("groundType")),
            roof:Boolean(formData.get("roof"))
        }
        if(pitch) {
            add(pitch);
        }
      };

    return (
    <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>ID de negocio asociado</label>
                    <input name="businessId" type="number" required />
                </div>
                <div className='crud-form-item'>
                    <label>Rating</label>
                    <input name="rating" type="number" required />
                </div>
                <div className='crud-form-item'>
                    <label>Precio</label>
                    <input name="price" type="number" required />
                </div>
                <div className='crud-form-item'>
                    <label>Tamaño de cancha</label>
                    <select name="size" required>
                        <option value="">Seleccionar tamaño</option>
                        <option value="pequeño">Pequeño</option>
                        <option value="mediano">Mediano</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select name="groundType" required>
                        <option value="">Seleccionar tipo de suelo</option>
                        <option value="césped natural">Césped natural</option>
                        <option value="césped sintético">Césped sintético</option>
                        <option value="cemento">Cemento</option>
                        <option value="arcilla">Arcilla</option>
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Techo</label>
                    <input type="checkbox" name="roof" />
                </div>
                <div className='crud-form-actions'>
                    <button type="submit" className='primary'>Crear</button>
                </div>
            </form>
            <pre>
            {loading && <p>Loading...</p>}
            {data && (
                <table className='crudTable'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Business ID</th>
                        <th>Rating</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Ground type</th>
                        <th>Roof</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{data.data.id}</td>
                        <td>{data.data.businessId}</td>
                        <td>{('⭐️').repeat(data.data.rating)}</td>
                        <td>${data.data.price}</td>
                        <td>{data.data.size}</td>
                        <td>{data.data.groundType}</td>
                        <td>{data.data.roof ? 'Techado':'Sin techo'}</td>
                    </tr>
                </tbody>
                </table>)}
                </pre>
        </div>)
}

type PitchResponse = {
    data:Pitch
} 