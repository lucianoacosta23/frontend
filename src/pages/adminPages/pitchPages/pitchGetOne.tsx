import type {Pitch} from '../../../types/pitchType.ts'
import { useState } from 'react';

export default function PitchGetOne(){
    const [data, setData] = useState<PitchResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:3000/api/pitchs/getOne/'+id)
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const json:PitchResponse = await response.json()
            setData(json)
        }catch(error){
            setError(error as Error)
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
        <div>
            <h2>Conseguir cancha</h2>
            <form onSubmit={handleSubmit}>
                <label>ID de la cancha</label>
                <input name="id" type="number" required />
                <button type="submit">Conseguir cancha</button>
            </form>
            <pre>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
                <table className='couponTable'>
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