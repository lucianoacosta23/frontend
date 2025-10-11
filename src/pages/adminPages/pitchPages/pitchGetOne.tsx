import type {Pitch} from '../../../types/pitchType.ts'
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { isApiError } from '../../../types/apiError.ts';

export default function PitchGetOne(){
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/pitchs/getOne/'+id, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }})
            if(!response.ok){
                const errors = await response.json()
                throw errors
            }
            const json:PitchResponse = await response.json()
            setData(json)
        }catch(error){
            if (isApiError(error)) {
                    if (error instanceof Error) {
                        showNotification(error.message,'error');
                        } 
                    }else {
                        showNotification("Error desconocido",'error');
                }
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const id = formData.get("id") as string;
        if (id) {
            getOne(id);
        }
  };
    
    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Conseguir cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>ID de la cancha</label>
                    <input name="id" type="number" required />
                </div>
                    <div className='crud-form-actions'>
                    <button type="submit" className='primary'>Conseguir cancha</button>
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
        </div>
    )
}

type PitchResponse = {
    data:Pitch
}